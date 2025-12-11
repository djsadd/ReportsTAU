import os

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response


app = FastAPI(title="Reports TAU API Gateway")


frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:4173")
origin_list = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8000/users")
REPORT_SERVICE_URL = os.getenv("REPORT_SERVICE_URL", "http://report-service:8000")
# For worklogs we point directly at the `/worklogs` prefix so that
# `/worklogs/my/resolved` on the gateway maps 1:1 to the upstream.
WORKLOG_SERVICE_URL = os.getenv("WORKLOG_SERVICE_URL", "http://worklog-service:8000/worklogs")


async def _proxy(request: Request, base_url: str, path: str) -> Response:
    url = base_url.rstrip("/")
    if path:
        url = f"{url}/{path.lstrip('/')}"

    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream_response = await client.request(
                request.method,
                url,
                content=await request.body(),
                headers=headers,
                params=request.query_params,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream request failed: {exc}") from exc

    filtered_headers = {
        name: value
        for name, value in upstream_response.headers.items()
        if name.lower() not in {"content-length", "transfer-encoding", "connection"}
    }

    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=filtered_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.api_route("/users", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def users_proxy(path: str = "", request: Request = None) -> Response:
    if request is None:
        raise HTTPException(status_code=400, detail="Invalid request")
    return await _proxy(request, USER_SERVICE_URL, path)


@app.api_route("/reports", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.api_route("/reports/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def reports_proxy(path: str = "", request: Request = None) -> Response:
    if request is None:
        raise HTTPException(status_code=400, detail="Invalid request")
    return await _proxy(request, REPORT_SERVICE_URL, path)


@app.api_route("/worklogs", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.api_route("/worklogs/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def worklogs_proxy(path: str = "", request: Request = None) -> Response:
    if request is None:
        raise HTTPException(status_code=400, detail="Invalid request")
    return await _proxy(request, WORKLOG_SERVICE_URL, path)

const ROUTES = [
  {
    "method": "GET",
    "path": "/api/dashboard",
    "request_path": "/api/dashboard",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [
      "recent_contacts",
      "tasks_due_today",
      "total_contacts",
      "total_tasks",
      "upcoming_tasks"
    ],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/contacts",
    "request_path": "/api/contacts",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/contacts/:id",
    "request_path": "/api/contacts/1",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [
      "company",
      "created_at",
      "email",
      "first_name",
      "id",
      "last_name",
      "notes",
      "phone",
      "updated_at"
    ],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/contacts/:id/activities",
    "request_path": "/api/contacts/1/activities",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/tasks",
    "request_path": "/api/tasks",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/tasks/:id",
    "request_path": "/api/tasks/1",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [
      "contact_id",
      "created_at",
      "description",
      "due_date",
      "id",
      "priority",
      "status",
      "title",
      "updated_at"
    ],
    "expects_json": true
  },
  {
    "method": "GET",
    "path": "/api/health",
    "request_path": "/api/health",
    "auth_required": false,
    "success_status": 200,
    "sample_body": null,
    "response_keys": [
      "status"
    ],
    "expects_json": true
  }
];
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8080";

function authHeaders(route: any, includeAuth: boolean = true) {
    if (!includeAuth || !route.auth_required) return {};
    const token = process.env.TEST_AUTH_TOKEN || "test-token";
    return { Authorization: `Bearer ${token}` };
}

async function ensureBackendReachable() {
    const healthPaths = ["/health", "/api/health"];
    for (const healthPath of healthPaths) {
        try {
            const response = await fetch(`${BASE_URL}${healthPath}`, { method: "GET" });
            if (response) return;
        } catch {
            // try next health endpoint
        }
    }
    throw new Error(
        `Backend not reachable at ${BASE_URL}. Start backend before running unit contract tests.`
    );
}

async function requestRoute(method: string, route: any, body?: any, includeAuth: boolean = true) {
    const requestPath = route.request_path || route.path;
    try {
        const response = await fetch(`${BASE_URL}${requestPath}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(route, includeAuth),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return { response, requestPath };
    } catch (err: any) {
        throw new Error(
            `${method} ${route.path} network failure against ${BASE_URL}${requestPath}: ${err?.message || String(err)}`
        );
    }
}

describe("Next.js API unit contracts", () => {
    beforeAll(async () => {
        await ensureBackendReachable();
    });

  describe("missing required field → 400/422", () => {
    for (const route of ROUTES) {
      const body = route.sample_body;
      if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length < 2) continue;
      for (const omitKey of Object.keys(body)) {
        it(`${route.method} ${route.path} missing '${omitKey}' → 400/422`, async () => {
          const partial = Object.fromEntries(Object.entries(body).filter(([k]) => k !== omitKey));
                    const { response, requestPath } = await requestRoute(route.method, route, partial, true);
                    if (![400, 422].includes(response.status)) {
                        throw new Error(
                            `${route.method} ${route.path} missing '${omitKey}' expected 400/422 got ${response.status} from ${requestPath}`
                        );
                    }
        });
      }
    }
  });

  describe("auth rejection → 401", () => {
    for (const route of ROUTES) {
      if (!route.auth_required) continue;
      it(`${route.method} ${route.path} without token → 401`, async () => {
                const { response, requestPath } = await requestRoute(route.method, route, undefined, false);
                if (response.status !== 401) {
                    throw new Error(
                        `${route.method} ${route.path} expected 401 (no auth) got ${response.status} from ${requestPath}`
                    );
                }
      });
    }
  });

  describe("wrong method → 405", () => {
    for (const route of ROUTES) {
      const wrong = route.method === "GET" ? "POST" : "GET";
      it(`wrong method ${wrong} on ${route.path} → 405`, async () => {
                const { response, requestPath } = await requestRoute(wrong, route, undefined, true);
                if (response.status !== 405) {
                    throw new Error(
                        `wrong method ${wrong} on ${route.path} expected 405 got ${response.status} from ${requestPath}`
                    );
                }
      });
    }
  });
});

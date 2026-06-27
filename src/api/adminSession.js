let token = null;

export function getAdminToken() {
    return token;
}

export function setAdminToken(t) {
    token = t;
}

export function clearAdminToken() {
    token = null;
}

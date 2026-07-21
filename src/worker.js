// QR Menu Guide — https://github.com/dumbuk12/qr-menu-guide
// Copyright (c) 2026 dumbuk12 — MIT License
//
// The Worker: handles /api/menu, serves static files for everything else
import { menu } from "../menu-data.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/menu") {
      return Response.json(menu);
    }

    return env.ASSETS.fetch(request);
  },
};

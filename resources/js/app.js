// app entrypoint
import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
  resolve: (name) => require(`./Pages/${name}.tsx`),
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});

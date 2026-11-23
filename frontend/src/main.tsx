import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { store } from "./store";
import { router } from "./router";

// useSession() consulta la sesion sola al cargar (por eso F5 la mantiene) y se actualiza despues de signIn / signOut.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

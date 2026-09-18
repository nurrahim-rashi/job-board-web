import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { AppRouter } from "./routes/AppRouter";
import { ModalScrollGuard } from "./components/site/ModalScrollGuard";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ModalScrollGuard />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 2147483647 }}
        toastOptions={{ style: { zIndex: 2147483647 } }}
      />
    </QueryClientProvider>
  </StrictMode>,
);

declare module "*.scss";
declare module "*.sass";

declare module "@cashfreepayments/cashfree-js" {
  interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal" | HTMLElement;
  }

  interface CashfreeCheckoutError {
    message: string;
    type: string;
    code?: string;
  }

  interface CashfreeCheckoutResult {
    error?: CashfreeCheckoutError;
    paymentDetails?: {
      paymentMessage?: string;
    };
  }

  interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<CashfreeCheckoutResult>;
  }

  interface LoadOptions {
    mode: "sandbox" | "production";
  }

  export function load(options: LoadOptions): Promise<CashfreeInstance>;
}

interface ImportMetaEnv {
  readonly VITE_CASHFREE_MODE: "sandbox" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

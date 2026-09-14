type GoogleCredentialResponse = {
  credential: string;
};

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (
          element: HTMLElement,
          options: {
            theme: "outline";
            size: "large";
            shape: "pill";
            text: "continue_with";
            width: number;
          },
        ) => void;
      };
    };
  };
}

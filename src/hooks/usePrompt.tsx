import { useState, useCallback, FC } from "react";

interface UsePromptReturn {
  prompt: (msg: string) => Promise<boolean>;
  Prompt: FC;
}

function usePrompt(): UsePromptReturn {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [promiseResolve, setPromiseResolve] = useState<
    ((value: boolean) => void) | null
  >(null);

  const prompt = useCallback((msg: string): Promise<boolean> => {
    setMessage(msg);
    setIsVisible(true);
    return new Promise<boolean>((resolve) => {
      setPromiseResolve(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (promiseResolve) {
      promiseResolve(result);
    }
    setIsVisible(false);
    setMessage("");
    setPromiseResolve(null);
  };

  const Prompt: FC = () => {
    if (!isVisible) return null;
    return (
      <div className="dialog-overlay">
        <div className="dialog">
          <p>{message}</p>
          <div className="dialog-actions">
            {" "}
            <button onClick={() => handleClose(false)}>Cancel</button>
            <button onClick={() => handleClose(true)}>OK</button>
          </div>
        </div>
      </div>
    );
  };

  return { prompt, Prompt };
}

export default usePrompt;

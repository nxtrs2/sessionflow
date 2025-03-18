import { useState, useCallback, FC } from "react";

interface UseAlertReturn {
  alert: (message: string) => Promise<void>;
  Alert: FC;
}

function useAlert(): UseAlertReturn {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [promiseResolve, setPromiseResolve] = useState<(() => void) | null>(
    null
  );

  const alert = useCallback((message: string): Promise<void> => {
    setMessage(message);
    setIsVisible(true);
    return new Promise<void>((resolve) => {
      setPromiseResolve(() => resolve);
    });
  }, []);

  const handleClose = () => {
    if (promiseResolve) {
      promiseResolve();
    }
    setIsVisible(false);
    setMessage("");
    setPromiseResolve(null);
  };

  const Alert: FC = () => {
    if (!isVisible) return null;
    return (
      <div className="dialog-overlay">
        <div className="dialog">
          <p>{message}</p>
          <button onClick={handleClose}>OK</button>
        </div>
      </div>
    );
  };

  return { alert, Alert };
}

export default useAlert;

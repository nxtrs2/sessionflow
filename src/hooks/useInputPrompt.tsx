import { useState, useCallback, FC } from "react";

interface UseInputPromptReturn {
  inputPrompt: (
    message: string,
    defaultValue?: string
  ) => Promise<string | null>;
  InputPrompt: FC;
}

function useInputPrompt(): UseInputPromptReturn {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [promiseResolve, setPromiseResolve] = useState<
    ((value: string | null) => void) | null
  >(null);

  const inputPrompt = useCallback(
    (message: string, defaultValue: string = ""): Promise<string | null> => {
      setMessage(message);
      setInputValue(defaultValue);
      setIsVisible(true);
      return new Promise<string | null>((resolve) => {
        setPromiseResolve(() => resolve);
      });
    },
    []
  );

  const handleClose = (result: string | null) => {
    if (promiseResolve) {
      promiseResolve(result);
    }
    setIsVisible(false);
    setMessage("");
    setInputValue("");
    setPromiseResolve(null);
  };

  const InputPrompt: FC = () => {
    if (!isVisible) return null;
    return (
      <div className="dialog-overlay">
        <div className="dialog">
          <p>{message}</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="dialog-actions">
            <button onClick={() => handleClose(inputValue)}>OK</button>
            <button onClick={() => handleClose(null)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return { inputPrompt, InputPrompt };
}

export default useInputPrompt;

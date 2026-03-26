import "./Spinner.css";

type SpinnerProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
};

export function Spinner({ message = "Loading\u2026", size = "md" }: SpinnerProps) {
  return (
    <div className={`spinner spinner--${size}`} role="status">
      <div className="spinner__circle" />
      {message && <p className="spinner__message">{message}</p>}
    </div>
  );
}

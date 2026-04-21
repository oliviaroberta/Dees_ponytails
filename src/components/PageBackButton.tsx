import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageBackButton = ({ fallbackTo = "/" }: { fallbackTo?: string }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground backdrop-blur transition-colors hover:bg-background"
    >
      <ArrowLeft size={15} />
      Back
    </button>
  );
};

export default PageBackButton;

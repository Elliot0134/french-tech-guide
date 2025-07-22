import { useLocation } from "react-router-dom";
import ResultsEarlyStage from "./ResultsEarlyStage";
import ResultsAdvancedStage from "./ResultsAdvancedStage";
import ResultsSecondFormSubmitted from "./ResultsSecondFormSubmitted"; // This will be used later for direct navigation

const Results = () => {
  const location = useLocation();
  const formData = location.state?.formData || {};
  const isSecondFormSubmitted = location.state?.isSecondFormSubmitted || false;

  // Check if user is in early stage (idea, mvp, prototype)
  const isEarlyStage = ["idea", "mvp", "prototype"].includes(formData.stage);

  if (isSecondFormSubmitted) {
    return <ResultsSecondFormSubmitted />;
  } else if (isEarlyStage) {
    return <ResultsEarlyStage />;
  } else {
    return <ResultsAdvancedStage />;
  }
};

export default Results;

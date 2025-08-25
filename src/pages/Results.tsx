import { useLocation } from "react-router-dom";
import ResultsEarlyStage from "./ResultsEarlyStage";
import ResultsAdvancedStage from "./ResultsAdvancedStage";
import ResultsSecondFormSubmitted from "./ResultsSecondFormSubmitted"; // This will be used later for direct navigation

const Results = () => {
  const location = useLocation();
  const formData = location.state?.formData || {};
  const isSecondFormSubmitted = location.state?.isSecondFormSubmitted || false;
  
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  // Check if user is in early stage (idea, mvp, prototype)
  const isEarlyStage = ["idea", "mvp", "prototype"].includes(formData.stage);

  if (isSecondFormSubmitted) {
    return <ResultsSecondFormSubmitted />;
  } else if (isEarlyStage) {
    return <ResultsEarlyStage projectId={projectId} />;
  } else {
    return <ResultsAdvancedStage projectId={projectId} />;
  }
};

export default Results;

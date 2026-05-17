import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator.jsx";
import Step1Upload from "../components/steps/Step1Upload.jsx";
import Step2Lyrics from "../components/steps/Step2Lyrics.jsx";
import Step3Render from "../components/steps/Step3Render.jsx";
import StepSuccess from "../components/steps/StepSuccess.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMusic,faRotate,faVideo} from "@fortawesome/free-solid-svg-icons";
import "./CreateVideo.css";

const STEPS = [
  { num: 1, label: "Upload Media", icon: (<FontAwesomeIcon icon={faMusic} style={{ color: "#ffffffff" }} />) },
  { num: 2, label: "Sync Lyrics",  icon: (<FontAwesomeIcon icon={faRotate} style={{ color: "#ffffffff" }} />) },
  { num: 3, label: "Render Video", icon: (<FontAwesomeIcon icon={faVideo} style={{ color: "#ffffffff" }} />) },
];

export default function CreateVideo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  // Shared state across steps
  const [videoId, setVideoId] = useState(null);
  const [videoMeta, setVideoMeta] = useState({ title: "", artist: "" });
  const [done, setDone] = useState(false);

  const handleStep1Done = ({ id, title }) => {
    setVideoId(id);
    setVideoMeta((m) => ({ ...m, title }));
    setStep(2);
  };

  const handleStep2Done = ({ artist, title }) => {
    setVideoMeta({ artist, title });
    setStep(3);
  };

  const handleStep3Done = () => {
    setDone(true);
  };

  const reset = () => {
    setStep(1);
    setVideoId(null);
    setVideoMeta({ title: "", artist: "" });
    setDone(false);
  };

  return (
    <div className="page create-page">
      <div className="page-header">
        <div className="tag">Create New</div>
        <h1>BUILD YOUR VIDEO</h1>
        <p>Three steps to a publish-ready lyric video.</p>
      </div>

      {!done && <StepIndicator steps={STEPS} current={step} />}

      <div className="create-body">
        {done ? (
          <StepSuccess
            videoMeta={videoMeta}
            onNew={reset}
            onLibrary={() => navigate("/library")}
          />
        ) : step === 1 ? (
          <Step1Upload onDone={handleStep1Done} />
        ) : step === 2 ? (
          <Step2Lyrics
            videoId={videoId}
            initialTitle={videoMeta.title}
            onDone={handleStep2Done}
            onBack={() => setStep(1)}
          />
        ) : (
          <Step3Render
            videoId={videoId}
            videoMeta={videoMeta}
            onDone={handleStep3Done}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

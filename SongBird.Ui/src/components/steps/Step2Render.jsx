import { useState, useEffect } from "react";

import { videoApi } from "../../services/api.js";
import DropZone from "../DropZone.jsx";

import "./Steps.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFilm,
  faFileLines,
  faFont,
  faBolt,
  faArrowLeft,
  faCheck,
  faCircleExclamation,
  faDesktop,
  faMobileScreenButton
} from "@fortawesome/free-solid-svg-icons";


export default function Step2Render({
  videoId,
  videoMeta,
  onDone,
  onBack
}) {

  const [isShort, setIsShort] =
    useState(false);

  const [srtFile, setSrtFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState(null);


  /*
   * Get values from Step 1
   */
  useEffect(() => {

    if (
      videoMeta?.isShort !== undefined
    ) {

      setIsShort(
        videoMeta.isShort
      );

    }

  }, [videoMeta]);


  /*
   * Render video
   */
  const handleSubmit = async () => {

    setLoading(true);

    setError(null);

    setProgress(0);


    /*
     * Fake progress while
     * backend is rendering
     */
    const ticker = setInterval(() => {

      setProgress((p) =>
        Math.min(
          p + Math.random() * 8,
          90
        )
      );

    }, 600);


    try {

      await videoApi.render({

        id: videoId,

        isShort,

        // Selected font from Step 1
        fontId:
          videoMeta?.fontId || null,

        srtFile:
          srtFile || undefined

      });


      clearInterval(ticker);

      setProgress(100);


      setTimeout(() => {

        onDone();

      }, 600);


    } catch (e) {

      clearInterval(ticker);

      setError(
        e.message ||
        "Render failed. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="step-panel">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="step-panel-header">

        <div className="step-panel-icon">

          <FontAwesomeIcon
            icon={faFilm}
          />

        </div>


        <div>

          <h2>
            Render Your Video
          </h2>

          <p>
            Review your output settings and
            optionally attach an SRT subtitle file.
          </p>

        </div>

      </div>


      {/* =====================================================
          VIDEO SUMMARY
      ====================================================== */}

      <div className="video-summary">


        <div className="vs-row">

          <span className="vs-label">
            Title
          </span>

          <span className="vs-val">
            {videoMeta?.title || "—"}
          </span>

        </div>


        <div className="vs-row">

          <span className="vs-label">
            Format
          </span>

          <span className="vs-val">

            {isShort
              ? "Short / Reel · 9:16"
              : "Full Length · 16:9"}

          </span>

        </div>


        <div className="vs-row">

          <span className="vs-label">
            Font
          </span>

          <span className="vs-val">

            {videoMeta?.fontName ||
              "Default Font"}

          </span>

        </div>


      </div>


      {/* =====================================================
          OUTPUT FORMAT
      ====================================================== */}

      <div className="format-selection">

        <div className="format-label">
          Output Format
        </div>


        <div className="format-options">


          {/* ================= FULL LENGTH ================= */}

          <button

            type="button"

            className={`format-option ${
              !isShort
                ? "selected"
                : ""
            }`}

            onClick={() =>
              setIsShort(false)
            }

            disabled={loading}

          >

            <div className="format-preview landscape">

              <FontAwesomeIcon
                icon={faDesktop}
              />

            </div>


            <div className="format-text">

              <div className="format-name">
                Full Length
              </div>

              <div className="format-desc">
                16:9 · Standard landscape
                video for YouTube
              </div>

            </div>


            {!isShort && (

              <div className="format-check">

                <FontAwesomeIcon
                  icon={faCheck}
                />

              </div>

            )}

          </button>


          {/* ================= SHORT ================= */}

          <button

            type="button"

            className={`format-option ${
              isShort
                ? "selected"
                : ""
            }`}

            onClick={() =>
              setIsShort(true)
            }

            disabled={loading}

          >

            <div className="format-preview portrait">

              <FontAwesomeIcon
                icon={faMobileScreenButton}
              />

            </div>


            <div className="format-text">

              <div className="format-name">
                Short / Reel
              </div>

              <div className="format-desc">
                9:16 · Vertical format for
                Shorts & Reels
              </div>

            </div>


            {isShort && (

              <div className="format-check">

                <FontAwesomeIcon
                  icon={faCheck}
                />

              </div>

            )}

          </button>


        </div>

      </div>


      {/* =====================================================
          FONT
      ====================================================== */}

      <div className="form-field">

        <label className="field-label">

          <span className="label-icon">

            <FontAwesomeIcon
              icon={faFont}
            />

          </span>

          Font Style

        </label>


        <div className="font-preview">

          {videoMeta?.fontName ||
            "Default Font"}

        </div>

      </div>


      {/* =====================================================
          SRT FILE
      ====================================================== */}

      <div
        className="form-field"
        style={{
          marginTop: 24
        }}
      >

        <label className="field-label">

          <span className="label-icon">

            <FontAwesomeIcon
              icon={faFileLines}
            />

          </span>

          SRT Subtitle File

          <span className="label-optional">
            Optional
          </span>

        </label>


        <DropZone

          accept=".srt"

          label="Drop your .srt subtitle file"

          subLabel="SubRip Text format — adds styled subtitles to the video"

          icon={
            <FontAwesomeIcon
              icon={faFileLines}
            />
          }

          file={srtFile}

          onFile={setSrtFile}

        />

      </div>


      {/* =====================================================
          PROGRESS
      ====================================================== */}

      {loading && (

        <div className="render-progress">


          <div className="rp-header">

            <span className="rp-label">
              Rendering...
            </span>

            <span className="rp-pct">
              {Math.round(progress)}%
            </span>

          </div>


          <div className="rp-track">

            <div
              className="rp-fill"
              style={{
                width:
                  `${progress}%`
              }}
            />

          </div>


          <div className="rp-stages">

            {[
              "Processing audio",
              "Syncing lyrics",
              "Compositing",
              "Encoding",
              "Finalising"
            ].map((stage, i) => (

              <span

                key={stage}

                className={`rp-stage ${
                  progress > i * 20
                    ? "done"
                    : ""
                }`}

              >

                {progress > i * 20 && (

                  <FontAwesomeIcon
                    icon={faCheck}
                  />

                )}

                {stage}

              </span>

            ))}

          </div>

        </div>

      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="step-error">

          <FontAwesomeIcon
            icon={faCircleExclamation}
          />

          {" "}

          {error}

        </div>

      )}


      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="step-actions">


        <button

          type="button"

          className="btn-ghost"

          onClick={onBack}

          disabled={loading}

        >

          <FontAwesomeIcon
            icon={faArrowLeft}
          />

          {" "}

          Back

        </button>


        <div className="step-tip">

          <span className="tip-icon">

            <FontAwesomeIcon
              icon={faBolt}
            />

          </span>

          Rendering typically takes
          1–3 minutes depending on
          video length.

        </div>


        <button

          type="button"

          className="btn-primary"

          onClick={handleSubmit}

          disabled={loading}

        >

          {loading ? (

            <>

              <span className="btn-spinner" />

              Rendering...

            </>

          ) : (

            <>

              <FontAwesomeIcon
                icon={faFilm}
              />

              {" "}

              Render Video

            </>

          )}

        </button>


      </div>

    </div>

  );

}
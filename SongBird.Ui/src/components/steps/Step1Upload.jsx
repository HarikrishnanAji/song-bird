import { useState, useEffect } from "react";
import { videoApi } from "../../services/api.js";
import DropZone from "../DropZone.jsx";
import "./Steps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faLightbulb,
  faMusic,
  faVideo,
  faMobileScreenButton,
  faDesktop,
  faFont,
  faCheck,
  faArrowRight,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

export default function Step1Upload({ onDone }) {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  // Backgrounds
  const [longBgFile, setLongBgFile] = useState(null);
  const [shortBgFile, setShortBgFile] = useState(null);
  // Output format
  const [isShort, setIsShort] = useState(false);
  // Fonts
  const [fonts, setFonts] = useState([]);
  const [fontId, setFontId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Select background according to
   * selected output format
   */
  const selectedBgFile = isShort
    ? shortBgFile
    : longBgFile;

  /*
   * Form validation
   */
  const valid =
    title.trim() &&
    audioFile &&
    selectedBgFile;

  /*
   * Load fonts from backend
   */
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const data = await videoApi.getFonts();
        setFonts(data || []);
      } catch (e) {
        console.error(
          "Failed to load fonts:",
          e
        );
      }
    };
    loadFonts();
  }, []);

  /*
   * Change output format
   */
  const handleFormatChange = (short) => {
    setIsShort(short);
  };

  /*
   * Submit
   */
  const handleSubmit = async () => {

    if (!valid) return;

    setLoading(true);
    setError(null);

    try {

      const res = await videoApi.create({

        title: title.trim(),

        audioFile,

        backgroundFile: selectedBgFile,

        // Send format to backend
        isShort,

        // Send selected font
        fontId: fontId || null

      });


      const id =
        res?.id ||
        res?.videoId ||
        res?.Id;


      if (!id) {

        throw new Error(
          "Video ID was not returned."
        );

      }


      /*
       * Find selected font
       */
      const selectedFont = fonts.find(
        (font) =>
          String(font.id) ===
          String(fontId)
      );


      /*
       * Pass information to Step 2
       */
      onDone({

        id,

        title: title.trim(),

        isShort,

        fontId,

        fontName:
          selectedFont?.name ||
          "Default Font"

      });


    } catch (e) {

      setError(
        e.message ||
        "Upload failed. Please try again."
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
            icon={faVideo}
          />

        </div>

        <div>

          <h2>
            Upload Your Audio & Background
          </h2>

          <p>
            Supported formats: MP3, WAV, FLAC,
            AAC, OGG, M4A for audio. JPG, PNG,
            WebP for background.
          </p>

        </div>

      </div>


      {/* =====================================================
          TITLE
      ====================================================== */}

      <div className="form-field full-width">

        <label className="field-label">

          <span className="label-icon">

            <FontAwesomeIcon
              icon={faVideo}
            />

          </span>

          Video Title *

        </label>


        <input
          className="field-input"
          type="text"
          placeholder="e.g. Blinding Lights — The Weeknd"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

      </div>


      {/* =====================================================
          OUTPUT FORMAT
      ====================================================== */}

      <div
        className="form-field full-width"
        style={{
          marginTop: 20
        }}
      >

        <label className="field-label">

          <span className="label-icon">

            <FontAwesomeIcon
              icon={faDesktop}
            />

          </span>

          Output Format

        </label>


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
              handleFormatChange(false)
            }
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
              handleFormatChange(true)
            }
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
          AUDIO + BACKGROUND
      ====================================================== */}

      <div
        className="form-grid"
        style={{
          marginTop: 20
        }}
      >


        {/* ================= AUDIO ================= */}

        <div className="form-field">

          <label className="field-label">

            <span className="label-icon">

              <FontAwesomeIcon
                icon={faMusic}
              />

            </span>

            Audio File *

          </label>


          <DropZone

            accept="audio/*"

            label="Drop audio file here"

            subLabel="MP3, WAV, FLAC, AAC supported"

            icon={
              <FontAwesomeIcon
                icon={faMusic}
              />
            }

            file={audioFile}

            onFile={setAudioFile}

          />

        </div>


        {/* ================= BACKGROUND ================= */}

        <div className="form-field">

          <label className="field-label">

            <span className="label-icon">

              <FontAwesomeIcon
                icon={faImage}
              />

            </span>

            Background Image *

          </label>


          <DropZone

            accept="image/*"

            label={
              isShort
                ? "Drop Short / Reel background"
                : "Drop Full Length background"
            }

            subLabel={
              isShort
                ? "JPG, PNG, WebP — 1080×1920 recommended"
                : "JPG, PNG, WebP — 1920×1080 recommended"
            }

            icon={
              <FontAwesomeIcon
                icon={faImage}
              />
            }

            file={
              isShort
                ? shortBgFile
                : longBgFile
            }

            onFile={
              isShort
                ? setShortBgFile
                : setLongBgFile
            }

          />

        </div>

      </div>


      {/* =====================================================
          FONT
      ====================================================== */}

      <div
        className="form-field"
        style={{
          marginTop: 20
        }}
      >

        <label className="field-label">

          <span className="label-icon">

            <FontAwesomeIcon
              icon={faFont}
            />

          </span>

          Font Style

        </label>


        <select

          className="field-input font-select"

          value={fontId}

          onChange={(e) =>
            setFontId(e.target.value)
          }

        >

          <option value="">
            Default Font
          </option>


          {fonts.map((font) => (

            <option
              key={font.id}
              value={font.id}
            >
              {font.name}
            </option>

          ))}

        </select>

      </div>


      {/* =====================================================
          AUDIO PREVIEW
      ====================================================== */}

      {audioFile && (

        <div className="audio-preview">

          <div className="ap-icon">

            <FontAwesomeIcon
              icon={faMusic}
            />

          </div>


          <div className="ap-info">

            <div className="ap-name">
              {audioFile.name}
            </div>

            <div className="ap-size">

              {(
                audioFile.size /
                1024 /
                1024
              ).toFixed(2)} MB

            </div>

          </div>


          <div className="ap-bars">

            {Array(8)
              .fill(0)
              .map((_, i) => (

                <span
                  key={i}
                  className="ap-bar"
                  style={{
                    animationDelay:
                      `${i * 0.07}s`,

                    animationDuration:
                      `${0.4 +
                        (i % 4) * 0.1}s`
                  }}
                />

              ))}

          </div>


          <button
            type="button"
            className="ap-remove"
            title="Remove audio"
            onClick={() =>
              setAudioFile(null)
            }
          >

            <FontAwesomeIcon
              icon={faXmark}
            />

          </button>

        </div>

      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="step-error">
          <FontAwesomeIcon
            icon={faXmark}
          />
          {" "}
          {error}
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ====================================================== */}
      <div className="step-actions">
        <div className="step-tip">
          <span className="tip-icon">
            <FontAwesomeIcon
              icon={faLightbulb}
            />
          </span>
          Use high-quality lossless audio
          for the best results.
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!valid || loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Uploading...
            </>
          ) : (
            <>
              Continue to Lyrics
              <FontAwesomeIcon
                icon={faArrowRight}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
} from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Spinner3D() {
  return (
    <Canvas style={{ height: 200 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh rotation={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial color="#1976d2" />
      </mesh>
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  );
}

export default function VideoUploader() {
  const [videoFile, setVideoFile] = useState(null);
  const [scriptText, setScriptText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!videoFile) return;
  
    const formData = new FormData();
    formData.append("video", videoFile);
  
    setLoading(true);
    setScriptText("");
  
    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok || !response.body) {
        throw new Error("Network response was not ok or body missing.");
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunkText = decoder.decode(value, { stream: true });
  
        try {
          const jsonChunk = JSON.parse(chunkText);
          if (jsonChunk.summary) {
            setScriptText((prev) => prev + jsonChunk.summary);
          } else {
            setScriptText((prev) => prev + chunkText); // fallback
          }
        } catch (e) {
          setScriptText((prev) => prev + chunkText); // fallback if chunk is not JSON
        }
  
        console.log("Chunk:", chunkText); // ✅ REMOVE invalid character here!
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setScriptText("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  }
  const handleFileRemove = () => {
    setVideoFile(null);
    setScriptText("");
  };
  const handlePlayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(scriptText);
    window.speechSynthesis.speak(utterance);
  };
  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
  };
  const handlePauseAudio = () => {
    window.speechSynthesis.pause();
  };
  const handleResumeAudio = () => {
    window.speechSynthesis.resume();
  };

  return (
    <Container maxWidth="100wh" sx={{ pt: 5, width: "90%" }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "2px solid #1976d2",
          width: "40%",
          mx: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Video to AI Summary
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          Upload a video file to generate a script using AI.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ textTransform: "none" }}
          >
            {videoFile ? "Change Video" : "Select Video File"}
            <input
              type="file"
              hidden
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </Button>
        </Box>

        {videoFile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Selected File:
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Paper
                elevation={1}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.5,
                  borderRadius: 16,
                  backgroundColor: "#e3f2fd",
                }}
              >
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {videoFile.name}
                </Typography>
                <Button
  size="small"
  onClick={handleFileRemove}
  sx={{ minWidth: "auto", p: 0, color: "#1976d2" }}
>
  ✕
</Button>

              </Paper>
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpload}
          disabled={!videoFile || loading}
        >
          {loading ? "Uploading..." : "Upload & Get Script"}
        </Button>

        {loading && (
          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" gutterBottom>
              Processing video...
            </Typography>
            <Spinner3D />
          </Box>
        )}
      </Paper>

      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
          border: "2px solid #1976d2",
          backgroundColor: "#f5f5f5",
          maxHeight: 500,
          overflowY: "auto",
          width: "95%",
          mx: "auto",
        }}
      >
        {scriptText.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ animation: "fadeIn 1s ease-in-out", whiteSpace: "pre-wrap" }}
            style={loading ? { color: "#1976d2" } : {}}
          >
            {`Upload a video to get the summary...`}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Generated Script
            </Typography>
            <Button
              variant="outlined"
              startIcon={<span role="img" aria-label="play">🔊</span>}
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(scriptText);
                window.speechSynthesis.speak(utterance);
              }}
            >
              Play Audio
            </Button>
          </Box>
        )}
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {scriptText}
        </pre>
      </Box>
      {/* <Box mt={2} textAlign="center" >
        <Typography variant="caption" color="textSecondary">
          Powered by TAO - Transformation AI
        </Typography>
      </Box> */}

     
    </Container>
  );
}

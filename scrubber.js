// 1440 frame fisici su desktop (720 su mobile grazie al salto alternato dei frame)
  const TOTAL_FRAMES = IS_MOBILE ? 720 : 1440;
  const SCENES_COUNT = 12; // trigger-0 … trigger-11

  function getFramePath(i) {
    const n = IS_MOBILE ? (i * 2 + 1) : (i + 1);
    return `frames/frame_${String(n).padStart(4, "0")}.jpg`;
  }

  // Mappatura temporale (in secondi) basata sulla riproduzione a 30fps del video mobile (120 frame = 4s di riproduzione)
  function getSceneTimeRange(index) {
    const ranges = [
      [0.0, 1.0],      // Scena 0: Intro (0-1s)
      [1.0, 4.0],      // Scena 1: NexusAI (1-4s)
      [4.0, 8.0],      // Scena 2: Concierge24 (4-8s)
      [8.0, 12.0],     // Scena 3: Dentis (8-12s)
      [12.0, 16.0],    // Scena 4: Lexis AI (12-16s)
      [16.0, 20.0],    // Scena 5: DriveMotion (16-20s)
      [20.0, 24.0],    // Scena 6: HomeTour AI (20-24s)
      [24.0, 28.0],    // Scena 7: OmniaStudio (24-28s)
      [28.0, 32.0],    // Scena 8: FF Edizioni (28-32s)
      [32.0, 36.0],    // Scena 9: Vision (32-36s) - NUOVO
      [36.0, 40.0],    // Scena 10: Ecosistema Connesso (36-40s)
      [40.0, 47.9]     // Scena 11: Contatti (40-48s)
    ];
    return {
      start: ranges[index][0],
      end: ranges[index][1]
    };
  }

  // Mappatura dei frame su Desktop (ogni clip da 8s a 15fps aggiunge esattamente 120 frame)
  function getSceneFrameRange(index) {
    const ranges = [
      [0, 30],         // Scena 0: Intro
      [30, 120],       // Scena 1: NexusAI
      [120, 240],      // Scena 2: Concierge24
      [240, 360],      // Scena 3: Dentis
      [360, 480],      // Scena 4: Lexis AI
      [480, 600],      // Scena 5: DriveMotion
      [600, 720],      // Scena 6: HomeTour AI
      [720, 840],      // Scena 7: OmniaStudio
      [840, 960],      // Scena 8: FF Edizioni
      [960, 1080],     // Scena 9: Vision - NUOVO
      [1080, 1200],    // Scena 10: Ecosistema Connesso
      [1200, 1439]     // Scena 11: Contatti (totale 1440 frame)
    ];
    const r = ranges[index];
    return {
      start: r[0],
      end: r[1]
    };
  }
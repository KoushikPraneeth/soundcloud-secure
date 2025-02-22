import { Track } from "../types";

export interface Picture {
  data: string;
  format: string;
  type: string;
  description: string;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  picture?: Picture;
}

const getBase64Picture = (picture: any): Picture => {
  return {
    data: `data:${picture.format};base64,${Buffer.from(picture.data).toString(
      "base64"
    )}`,
    format: picture.format,
    type: picture.type,
    description: picture.description || "Album Art",
  };
};

export const getMetadata = async (track: Track): Promise<AudioMetadata> => {
  try {
    // Metadata parsing logic here...
    // For now, returning placeholder metadata
    return {
      title: track.name,
      artist: "Unknown Artist",
      album: "Unknown Album",
      year: "2024",
      genre: "Unknown Genre",
      picture: {
        data: `data:image/svg+xml;base64,${Buffer.from(
          `
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f3f4f6"/>
            <path d="M100 65c-19.33 0-35 15.67-35 35s15.67 35 35 35 35-15.67 35-35-15.67-35-35-35zm0 60c-13.785 0-25-11.215-25-25s11.215-25 25-25 25 11.215 25 25-11.215 25-25 25z" fill="#9ca3af"/>
            <circle cx="100" cy="100" r="10" fill="#9ca3af"/>
            <path d="M100 40v-10" stroke="#9ca3af" stroke-width="4"/>
            <path d="M100 170v-10" stroke="#9ca3af" stroke-width="4"/>
            <path d="M40 100h-10" stroke="#9ca3af" stroke-width="4"/>
            <path d="M170 100h-10" stroke="#9ca3af" stroke-width="4"/>
          </svg>
        `
        ).toString("base64")}`,
        format: "image/svg+xml",
        type: "Front Cover",
        description: "Default Album Art",
      },
    };
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return {
      title: track.name,
    };
  }
};

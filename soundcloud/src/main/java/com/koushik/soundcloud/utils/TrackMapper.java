package com.koushik.soundcloud.utils;

import org.springframework.stereotype.Component;

import com.koushik.soundcloud.dto.response.TrackResponse;
import com.koushik.soundcloud.entity.Track;

@Component
public class TrackMapper {

    public TrackResponse toDto(Track track) {
        return TrackResponse.builder()
            .id(track.getId())
            .title(track.getTitle())
            .artist(track.getArtist())
            .album(track.getAlbum())
            .genre(track.getGenre())
            .year(track.getYear())
            .duration(track.getDuration())
            .format(track.getFormat())
            .bitrate(track.getBitrate())
            .fileId(track.getFileId())
            .createdAt(track.getCreatedAt())
            .updatedAt(track.getUpdatedAt())
            .build();
    }
}

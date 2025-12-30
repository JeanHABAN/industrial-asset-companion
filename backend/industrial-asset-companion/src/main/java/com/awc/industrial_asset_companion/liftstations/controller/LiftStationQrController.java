package com.awc.industrial_asset_companion.liftstations.controller;

import com.awc.industrial_asset_companion.dr.QrMaker;
import com.awc.industrial_asset_companion.liftstations.LiftStationRepo;
import com.awc.industrial_asset_companion.liftstations.MapLinks;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.UUID;


@RestController
@RequestMapping("/api/stations")
public class LiftStationQrController {
    private final LiftStationRepo repo;
    public LiftStationQrController(LiftStationRepo repo){ this.repo = repo; }

    @GetMapping("/{id}/qr/android")
    public ResponseEntity<byte[]> qrAndroid(@PathVariable UUID id) throws Exception {
        var ls = repo.findById(id).orElseThrow();
        String payload = MapLinks.androidGeo(ls.getLatitude(), ls.getLongitude(), ls.getName());
        return pngResponse(QrMaker.qrPng(payload, 600), "station-android-qr.png");
    }

    @GetMapping("/{id}/qr/ios")
    public ResponseEntity<byte[]> qrIos(@PathVariable UUID id) throws Exception {
        var ls = repo.findById(id).orElseThrow();
        String payload = MapLinks.appleMapsAppDirections(ls.getLatitude(), ls.getLongitude(), ls.getName());
        return pngResponse(QrMaker.qrPng(payload, 600), "station-ios-qr.png");
    }

    /** Composite label with both QRs and captions (ready to print). */
    @GetMapping("/{id}/qr/label")
    public ResponseEntity<byte[]> qrLabel(@PathVariable UUID id) throws Exception {
        var ls = repo.findById(id).orElseThrow();
        var android = QrMaker.qrPng(MapLinks.androidGeo(ls.getLatitude(), ls.getLongitude(), ls.getName()), 500);
        var ios     = QrMaker.qrPng(MapLinks.appleMapsAppDirections(ls.getLatitude(), ls.getLongitude(), ls.getName()), 500);
        BufferedImage label = QrMaker.labelWithTwoQrs(android, "Android (geo:)", ios, "iPhone (maps://)", 40, 60);
        return pngResponse(label, "station-qrs-label.png");
    }

    private ResponseEntity<byte[]> pngResponse(BufferedImage img, String filename) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.IMAGE_PNG)
                .body(baos.toByteArray());
    }
}

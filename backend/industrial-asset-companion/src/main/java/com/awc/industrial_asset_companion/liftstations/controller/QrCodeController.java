package com.awc.industrial_asset_companion.liftstations.controller;

import com.awc.industrial_asset_companion.service.QrCodeService;
import com.google.zxing.WriterException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {
    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping(produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQr(@RequestParam String text) throws WriterException, IOException {
        byte[] qrImage = qrCodeService.generateQrCode(text, 300, 300);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"qrcode.png\"")
                .body(qrImage);
    }


}

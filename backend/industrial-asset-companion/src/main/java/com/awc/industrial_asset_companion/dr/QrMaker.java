package com.awc.industrial_asset_companion.dr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

public class QrMaker {
    public static BufferedImage qrPng(String text, int sizePx) throws WriterException {
        QRCodeWriter writer = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1); // small white border
        BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, sizePx, sizePx, hints);
        return MatrixToImageWriter.toBufferedImage(matrix);
    }

    /** Combines two QR codes side-by-side with labels (for printing). */
    public static BufferedImage labelWithTwoQrs(
            BufferedImage left, String leftCaption,
            BufferedImage right, String rightCaption,
            int padding, int captionHeight) {

        int w = left.getWidth() + right.getWidth() + padding * 3;
        int h = Math.max(left.getHeight(), right.getHeight()) + captionHeight + padding * 3;

        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = out.createGraphics();
        g.setColor(Color.WHITE); g.fillRect(0,0,w,h);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.BLACK);

        int yTop = padding;
        int xLeft = padding;
        int xRight = padding * 2 + left.getWidth();

        g.drawImage(left, xLeft, yTop, null);
        g.drawImage(right, xRight, yTop, null);

        // captions
        Font font = new Font("Arial", Font.BOLD, 16);
        g.setFont(font);
        FontMetrics fm = g.getFontMetrics();

        int yCap = yTop + Math.max(left.getHeight(), right.getHeight()) + fm.getAscent() + padding;
        int lx = xLeft + (left.getWidth() - fm.stringWidth(leftCaption)) / 2;
        int rx = xRight + (right.getWidth() - fm.stringWidth(rightCaption)) / 2;

        g.drawString(leftCaption, Math.max(lx, padding), yCap);
        g.drawString(rightCaption, Math.max(rx, padding), yCap);

        g.dispose();
        return out;
    }
}

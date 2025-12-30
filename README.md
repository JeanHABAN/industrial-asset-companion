# industrial-asset-companion


A mobile-first navigation and asset location platform for utility field operations.
Industrial Asset Companion helps technicians quickly find lift stations and critical devices inside treatment plants—without spreadsheets, phone calls, or prior site familiarity.

Problem

Field crews often rely on Excel sheets, static lists, or tribal knowledge to locate assets. This slows response time, increases risk, and makes on-call work harder—especially for technicians unfamiliar with a site.

Solution

The platform provides:

Fast navigation to lift stations

Clear, story-based guidance to locate devices inside plants

One-tap navigation using Google Maps or Apple Maps

QR codes for quick access in the field

Architecture

Mobile App (Expo / React Native)

Read-only, no login

Optimized for on-call and field use

Web App

Login required

Used for creating and maintaining asset data (CRUD)

Backend (Spring Boot)

Public read endpoints for mobile

Secured endpoints for web management

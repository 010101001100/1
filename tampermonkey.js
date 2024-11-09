// ==UserScript==
// @name         Instagram & X.com Image Sync
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Syncs Instagram and X.com images with Python WebSocket server
// @match        https://www.instagram.com/*
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let ws = null;
    const seenImages = new Set();
    const images = [];

    // WebSocket connection
    function connectWebSocket() {
        ws = new WebSocket('ws://localhost:8080');
        
        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            syncImages();
        };
        
        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setTimeout(connectWebSocket, 5000); // Reconnect every 5 seconds
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    function syncImages() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'images',
                images: images.map(url => ({ url, isSelected: false }))
            }));
        }
    }

    function processNewImage(url) {
        if (!seenImages.has(url)) {
            seenImages.add(url);
            images.push(url);
            syncImages();
        }
    }

    function scanForImages() {
        // Instagram images
        document.querySelectorAll("img[src*='instagram.com']").forEach(img => {
            if (img.src && img.src.length > 0) {
                processNewImage(img.src);
            }
        });

        // X.com images (excluding profile pictures)
        document.querySelectorAll("img[src*='pbs.twimg.com']").forEach(img => {
            if (img.src && !img.src.includes('/profile_images/')) {
                const highResUrl = img.src.replace(/name=[^&]*/, 'name=orig');
                processNewImage(highResUrl);
            }
        });
    }

    // Initial connection
    connectWebSocket();

    // Scan for new images every 5 seconds
    setInterval(scanForImages, 5000);

    // Create floating indicator
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.bottom = '20px';
    indicator.style.right = '20px';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    indicator.style.color = 'white';
    indicator.style.padding = '8px 12px';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '12px';
    indicator.style.zIndex = '9999';
    document.body.appendChild(indicator);

    // Update indicator status
    setInterval(() => {
        const status = ws && ws.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected';
        const color = status === 'Connected' ? '#4ade80' : '#ef4444';
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></div>
                <span>Image Sync: ${status}</span>
                <span style="margin-left: 8px;">(${images.length} images)</span>
            </div>
        `;
    }, 1000);
})();
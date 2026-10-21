/**
 * MIRATH (ميراث) - High-Precision Geomagnetism Engine
 * Based on the Official World Magnetic Model (WMM 2025 - 2030)
 * Computes exact magnetic declination (variation) worldwide.
 * Zero external dependencies.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MirathGeoMag = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX_N = 12;
  const SIZE = MAX_N + 1;
  const DEG_TO_RAD = Math.PI / 180;
  const RAD_TO_DEG = 180 / Math.PI;

  const MODEL_EPOCH = 2025.0;
  const MODEL_VALID_UNTIL = 2030.0;

  const globe = {
    a: 6378.137, // semi-major axis (km)
    b: 6356.7523142, // semi-minor axis (km)
    r0: 6371.2 // mean radius (km)
  };

  // Official NOAA WMM 2025-2030 Spherical Harmonic Coefficients
  const gnmWmm = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-29351.8, -1410.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-2556.6, 2951.1, 1649.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1361.0, -2404.1, 1243.8, 453.6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [895.0, 799.5, 55.7, -281.1, 12.1, 0, 0, 0, 0, 0, 0, 0, 0],
    [-233.2, 368.9, 187.2, -138.7, -142.0, 20.9, 0, 0, 0, 0, 0, 0, 0],
    [64.4, 63.8, 76.9, -115.7, -40.9, 14.9, -60.7, 0, 0, 0, 0, 0, 0],
    [79.5, -77.0, -8.8, 59.3, 15.8, 2.5, -11.1, 14.2, 0, 0, 0, 0, 0],
    [23.2, 10.8, -17.5, 2.0, -21.7, 16.9, 15.0, -16.8, 0.9, 0, 0, 0, 0],
    [4.6, 7.8, 3.0, -0.2, -2.5, -13.1, 2.4, 8.6, -8.7, -12.9, 0, 0, 0],
    [-1.3, -6.4, 0.2, 2.0, -1.0, -0.6, -0.9, 1.5, 0.9, -2.7, -3.9, 0, 0],
    [2.9, -1.5, -2.5, 2.4, -0.6, -0.1, -0.6, -0.1, 1.1, -1.0, -0.2, 2.6, 0],
    [-2.0, -0.2, 0.3, 1.2, -1.3, 0.6, 0.6, 0.5, -0.1, -0.4, -0.2, -1.3, -0.7]
  ];

  const hnmWmm = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4545.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -3133.6, -815.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -56.6, 237.5, -549.5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 278.6, -133.9, 212.0, -375.6, 0, 0, 0, 0, 0, 0, 0],
    [0, 45.4, 220.2, -122.9, 43.0, 106.1, 0, 0, 0, 0, 0, 0, 0],
    [0, -18.4, 16.8, 48.8, -59.8, 10.9, 72.7, 0, 0, 0, 0, 0, 0],
    [0, -48.9, -14.4, -1.0, 23.4, -7.4, -25.1, -2.3, 0, 0, 0, 0, 0],
    [0, 7.1, -12.6, 11.4, -9.7, 12.7, 0.7, -5.2, 3.9, 0, 0, 0, 0],
    [0, -24.8, 12.2, 8.3, -3.3, -5.2, 7.2, -0.6, 0.8, 10.0, 0, 0, 0],
    [0, 3.3, 0.0, 2.4, 5.3, -9.1, 0.4, -4.2, -3.8, 0.9, -9.1, 0, 0],
    [0, 0, 2.9, -0.6, 0.2, 0.5, -0.3, -1.2, -1.7, -2.9, -1.8, -2.3, 0],
    [0, -1.3, 0.7, 1.0, -1.4, 0.0, 0.6, -0.1, 0.8, 0.1, -1.0, 0.1, 0.2]
  ];

  const gtnmWmm = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [12.0, 9.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-11.6, -5.2, -8.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-1.3, -4.2, 0.4, -15.6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-1.6, -2.4, -6.0, 5.6, -7.0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.6, 1.4, 0.0, 0.6, 2.2, 0.9, 0, 0, 0, 0, 0, 0, 0],
    [-0.2, -0.4, 0.9, 1.2, -0.9, 0.3, 0.9, 0, 0, 0, 0, 0, 0],
    [-0, -0.1, -0.1, 0.5, -0.1, -0.8, -0.8, 0.8, 0, 0, 0, 0, 0],
    [-0.1, 0.2, 0.0, 0.5, -0.1, 0.3, 0.2, -0, 0.2, 0, 0, 0, 0],
    [-0, -0.1, 0.1, 0.3, -0.3, 0, 0.3, -0.1, 0.1, -0.1, 0, 0, 0],
    [0.1, 0.0, 0.1, 0.1, -0, -0.3, 0, -0.1, -0.1, -0, -0, 0, 0],
    [0, -0, 0, 0, 0, -0.1, 0, -0, -0.1, -0.1, -0.1, -0.1, 0],
    [0, 0, -0, -0, -0, -0, 0.1, -0, 0, 0, -0.1, -0, -0.1]
  ];

  const htnmWmm = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -22.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, -32.9, -21.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5.4, 2.0, -10.6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0.6, 3.4, 1.8, 3.5, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0.3, 2.0, -1.0, 0.0, -0.3, 0, 0, 0, 0, 0, 0, 0],
    [0, -0.5, -1.9, 0.2, 2.5, -0.5, -0.7, 0, 0, 0, 0, 0, 0],
    [0, 0.5, -0.4, 0.3, 0.3, 0.4, 0.1, -0.5, 0, 0, 0, 0, 0],
    [0, -0.4, -0.4, -0.3, 0.2, -0.2, -0.4, -0.2, 0.4, 0, 0, 0, 0],
    [0, 0.0, -0.2, 0.0, 0.0, 0.0, -0.1, 0.3, 0.0, 0.2, 0, 0, 0],
    [0, -0.1, -0.1, -0.1, -0.1, 0.0, -0.1, 0.0, -0.1, -0.1, -0.1, 0, 0],
    [0, 0, 0.0, 0.1, 0.0, 0.0, 0.1, 0.0, 0.0, -0.1, 0.0, 0.0, 0],
    [0, 0.1, 0.0, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, -0.1]
  ];

  const zeroArray2D = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0));

  const P = zeroArray2D(SIZE, SIZE);
  const DP = zeroArray2D(SIZE, SIZE);
  const gnm = zeroArray2D(SIZE, SIZE);
  const hnm = zeroArray2D(SIZE, SIZE);
  const sm = new Array(SIZE).fill(0);
  const cm = new Array(SIZE).fill(0);
  const root = new Array(SIZE).fill(0);
  const roots = zeroArray2D(SIZE, SIZE).map(() => Array.from({ length: SIZE }, () => [0, 0]));

  for (let n = 2; n <= MAX_N; n++) {
    root[n] = Math.sqrt((2.0 * n - 1) / (2.0 * n));
  }

  for (let m = 0; m <= MAX_N; m++) {
    const mm = m * m;
    for (let n = Math.max(m + 1, 2); n <= MAX_N; n++) {
      roots[m][n][0] = Math.sqrt((n - 1) * (n - 1) - mm);
      roots[m][n][1] = 1.0 / Math.sqrt(n * n - mm);
    }
  }

  let cachedYear = NaN;

  function updateSecularVariation(decimalYear) {
    if (decimalYear === cachedYear) return;
    cachedYear = decimalYear;
    const yearFrac = decimalYear - MODEL_EPOCH;
    for (let n = 1; n <= MAX_N; n++) {
      for (let m = 0; m <= n; m++) {
        gnm[n][m] = gnmWmm[n][m] + yearFrac * gtnmWmm[n][m];
        hnm[n][m] = hnmWmm[n][m] + yearFrac * htnmWmm[n][m];
      }
    }
  }

  function getDecimalYear() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const next = Date.UTC(year + 1, 0, 1);
    return year + (Date.now() - start) / (next - start);
  }

  /**
   * Calculate Magnetic Declination in degrees (-180 to +180)
   * Positive = Magnetic North is East of True North
   * Negative = Magnetic North is West of True North
   * @param {number} latitude - Latitude in degrees (-90 to +90)
   * @param {number} longitude - Longitude in degrees (-180 to +180)
   * @param {number} [altitudeKm=0] - Altitude above sea level in km
   * @returns {number} Declination in degrees
   */
  function getDeclination(latitude, longitude, altitudeKm = 0) {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return 0;
    const decimalYear = getDecimalYear();
    updateSecularVariation(decimalYear);

    const latRad = latitude * DEG_TO_RAD;
    const lonRad = longitude * DEG_TO_RAD;
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sr = Math.sqrt(globe.a ** 2 * cosLat ** 2 + globe.b ** 2 * sinLat ** 2);
    const theta = Math.atan2(
      cosLat * (altitudeKm * sr + globe.a ** 2),
      sinLat * (altitudeKm * sr + globe.b ** 2)
    );
    const r = Math.sqrt(
      altitudeKm ** 2 +
      2 * altitudeKm * sr +
      (globe.a ** 4 - (globe.a ** 4 - globe.b ** 4) * sinLat ** 2) /
      (globe.a ** 2 - (globe.a ** 2 - globe.b ** 2) * sinLat ** 2)
    );
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const invS = 1 / (s + (s === 0 ? 1e-8 : 0));

    P[0][0] = 1.0;
    P[1][1] = s;
    DP[0][0] = 0.0;
    DP[1][1] = c;
    P[1][0] = c;
    DP[1][0] = -s;

    for (let n = 2; n <= MAX_N; n++) {
      P[n][n] = P[n - 1][n - 1] * s * root[n];
      DP[n][n] = (DP[n - 1][n - 1] * s + P[n - 1][n - 1] * c) * root[n];
    }

    for (let m = 0; m <= MAX_N; m++) {
      for (let n = Math.max(m + 1, 2); n <= MAX_N; n++) {
        P[n][m] = (P[n - 1][m] * c * (2 * n - 1) - P[n - 2][m] * roots[m][n][0]) * roots[m][n][1];
        DP[n][m] = ((DP[n - 1][m] * c - P[n - 1][m] * s) * (2 * n - 1) - DP[n - 2][m] * roots[m][n][0]) * roots[m][n][1];
      }
    }

    for (let m = 0; m <= MAX_N; m++) {
      sm[m] = Math.sin(m * lonRad);
      cm[m] = Math.cos(m * lonRad);
    }

    let BR = 0.0;
    let BTheta = 0.0;
    let BPhi = 0.0;
    const fn0 = globe.r0 / r;
    let fn = fn0 ** 2;

    for (let n = 1; n <= MAX_N; n++) {
      let c1n = 0, c2n = 0, c3n = 0;
      for (let m = 0; m <= n; m++) {
        const tmp = gnm[n][m] * cm[m] + hnm[n][m] * sm[m];
        c1n += tmp * P[n][m];
        c2n += tmp * DP[n][m];
        c3n += m * (gnm[n][m] * sm[m] - hnm[n][m] * cm[m]) * P[n][m];
      }
      fn *= fn0;
      BR += (n + 1) * c1n * fn;
      BTheta -= c2n * fn;
      BPhi += c3n * fn * invS;
    }

    const psi = theta - (Math.PI / 2 - latRad);
    const x = -BTheta * Math.cos(psi) - BR * Math.sin(psi);
    const y = BPhi;

    const decl = (x !== 0.0 || y !== 0.0) ? Math.atan2(y, x) * RAD_TO_DEG : 0.0;
    return Math.round(decl * 100) / 100;
  }

  /**
   * Convert True Bearing to Magnetic Bearing using declination
   * Magnetic = True - Declination
   */
  function trueToMagnetic(trueBearing, declination) {
    return (trueBearing - declination + 360) % 360;
  }

  /**
   * Convert Magnetic Bearing to True Bearing using declination
   * True = Magnetic + Declination
   */
  function magneticToTrue(magneticBearing, declination) {
    return (magneticBearing + declination + 360) % 360;
  }

  return {
    getDeclination,
    trueToMagnetic,
    magneticToTrue,
    version: 'WMM-2025'
  };
});

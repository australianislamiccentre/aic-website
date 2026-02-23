/**
 * Prayer Times Calculator for Australian Islamic Centre
 *
 * Based on fixed yearly schedule with DST handling for Melbourne, Australia.
 *
 * @module lib/prayer-times
 * @see src/lib/prayer-config.ts — iqamah offset & fixed-time configuration
 */

import { getIqamahConfig } from "./prayer-config";
import type { SanityPrayerSettings } from "@/types/sanity";

// Prayer times data for each day of the year
// Format: [Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha]
const PRAYER_TIMES_DATA: string[][] = [
  // January (days 1-31)
  ["4:05 AM", "5:57 AM", "1:26 PM", "5:21 PM", "8:52 PM", "10:17 PM"],
  ["4:06 AM", "5:58 AM", "1:27 PM", "5:21 PM", "8:52 PM", "10:17 PM"],
  ["4:07 AM", "5:59 AM", "1:27 PM", "5:22 PM", "8:52 PM", "10:17 PM"],
  ["4:08 AM", "5:59 AM", "1:28 PM", "5:22 PM", "8:52 PM", "10:16 PM"],
  ["4:09 AM", "6:00 AM", "1:28 PM", "5:22 PM", "8:52 PM", "10:16 PM"],
  ["4:10 AM", "6:01 AM", "1:29 PM", "5:23 PM", "8:52 PM", "10:16 PM"],
  ["4:11 AM", "6:02 AM", "1:29 PM", "5:23 PM", "8:52 PM", "10:16 PM"],
  ["4:13 AM", "6:03 AM", "1:29 PM", "5:24 PM", "8:52 PM", "10:16 PM"],
  ["4:14 AM", "6:04 AM", "1:30 PM", "5:24 PM", "8:52 PM", "10:15 PM"],
  ["4:15 AM", "6:05 AM", "1:30 PM", "5:24 PM", "8:52 PM", "10:15 PM"],
  ["4:17 AM", "6:07 AM", "1:31 PM", "5:25 PM", "8:52 PM", "10:14 PM"],
  ["4:18 AM", "6:08 AM", "1:31 PM", "5:25 PM", "8:51 PM", "10:14 PM"],
  ["4:19 AM", "6:09 AM", "1:31 PM", "5:25 PM", "8:51 PM", "10:13 PM"],
  ["4:21 AM", "6:10 AM", "1:32 PM", "5:25 PM", "8:51 PM", "10:13 PM"],
  ["4:22 AM", "6:11 AM", "1:32 PM", "5:26 PM", "8:51 PM", "10:12 PM"],
  ["4:24 AM", "6:12 AM", "1:33 PM", "5:26 PM", "8:50 PM", "10:12 PM"],
  ["4:25 AM", "6:13 AM", "1:33 PM", "5:26 PM", "8:50 PM", "10:11 PM"],
  ["4:27 AM", "6:14 AM", "1:33 PM", "5:26 PM", "8:49 PM", "10:10 PM"],
  ["4:28 AM", "6:15 AM", "1:34 PM", "5:26 PM", "8:49 PM", "10:09 PM"],
  ["4:30 AM", "6:16 AM", "1:34 PM", "5:27 PM", "8:48 PM", "10:09 PM"],
  ["4:31 AM", "6:17 AM", "1:34 PM", "5:27 PM", "8:48 PM", "10:08 PM"],
  ["4:33 AM", "6:18 AM", "1:34 PM", "5:27 PM", "8:47 PM", "10:07 PM"],
  ["4:34 AM", "6:19 AM", "1:35 PM", "5:27 PM", "8:47 PM", "10:06 PM"],
  ["4:36 AM", "6:20 AM", "1:35 PM", "5:27 PM", "8:46 PM", "10:05 PM"],
  ["4:37 AM", "6:21 AM", "1:35 PM", "5:27 PM", "8:45 PM", "10:04 PM"],
  ["4:39 AM", "6:22 AM", "1:35 PM", "5:27 PM", "8:45 PM", "10:03 PM"],
  ["4:41 AM", "6:23 AM", "1:36 PM", "5:27 PM", "8:44 PM", "10:02 PM"],
  ["4:42 AM", "6:24 AM", "1:36 PM", "5:27 PM", "8:43 PM", "10:01 PM"],
  ["4:44 AM", "6:25 AM", "1:36 PM", "5:27 PM", "8:42 PM", "10:00 PM"],
  ["4:45 AM", "6:27 AM", "1:36 PM", "5:27 PM", "8:42 PM", "9:59 PM"],
  ["4:47 AM", "6:28 AM", "1:36 PM", "5:27 PM", "8:41 PM", "9:58 PM"],
  // February (days 32-59)
  ["4:49 AM", "6:29 AM", "1:37 PM", "5:27 PM", "8:40 PM", "9:56 PM"],
  ["4:50 AM", "6:30 AM", "1:37 PM", "5:27 PM", "8:39 PM", "9:55 PM"],
  ["4:52 AM", "6:31 AM", "1:37 PM", "5:26 PM", "8:38 PM", "9:54 PM"],
  ["4:53 AM", "6:32 AM", "1:37 PM", "5:26 PM", "8:37 PM", "9:53 PM"],
  ["4:55 AM", "6:33 AM", "1:37 PM", "5:26 PM", "8:36 PM", "9:52 PM"],
  ["4:57 AM", "6:35 AM", "1:37 PM", "5:26 PM", "8:35 PM", "9:50 PM"],
  ["4:58 AM", "6:36 AM", "1:37 PM", "5:26 PM", "8:34 PM", "9:49 PM"],
  ["5:00 AM", "6:37 AM", "1:37 PM", "5:25 PM", "8:33 PM", "9:48 PM"],
  ["5:01 AM", "6:38 AM", "1:37 PM", "5:25 PM", "8:32 PM", "9:46 PM"],
  ["5:03 AM", "6:39 AM", "1:37 PM", "5:25 PM", "8:31 PM", "9:45 PM"],
  ["5:04 AM", "6:40 AM", "1:37 PM", "5:24 PM", "8:30 PM", "9:43 PM"],
  ["5:06 AM", "6:41 AM", "1:37 PM", "5:24 PM", "8:29 PM", "9:42 PM"],
  ["5:07 AM", "6:43 AM", "1:37 PM", "5:24 PM", "8:28 PM", "9:41 PM"],
  ["5:09 AM", "6:44 AM", "1:37 PM", "5:23 PM", "8:26 PM", "9:39 PM"],
  ["5:10 AM", "6:45 AM", "1:37 PM", "5:23 PM", "8:25 PM", "9:38 PM"],
  ["5:12 AM", "6:46 AM", "1:37 PM", "5:22 PM", "8:24 PM", "9:36 PM"],
  ["5:13 AM", "6:47 AM", "1:37 PM", "5:22 PM", "8:23 PM", "9:35 PM"],
  ["5:15 AM", "6:48 AM", "1:37 PM", "5:21 PM", "8:22 PM", "9:33 PM"],
  ["5:16 AM", "6:49 AM", "1:37 PM", "5:21 PM", "8:20 PM", "9:32 PM"],
  ["5:18 AM", "6:50 AM", "1:37 PM", "5:20 PM", "8:19 PM", "9:30 PM"],
  ["5:19 AM", "6:51 AM", "1:37 PM", "5:20 PM", "8:18 PM", "9:29 PM"],
  ["5:21 AM", "6:52 AM", "1:37 PM", "5:19 PM", "8:16 PM", "9:27 PM"],
  ["5:22 AM", "6:54 AM", "1:37 PM", "5:19 PM", "8:15 PM", "9:26 PM"],
  ["5:23 AM", "6:55 AM", "1:36 PM", "5:18 PM", "8:14 PM", "9:24 PM"],
  ["5:25 AM", "6:56 AM", "1:36 PM", "5:17 PM", "8:12 PM", "9:22 PM"],
  ["5:26 AM", "6:57 AM", "1:36 PM", "5:17 PM", "8:11 PM", "9:21 PM"],
  ["5:27 AM", "6:58 AM", "1:36 PM", "5:16 PM", "8:10 PM", "9:19 PM"],
  ["5:29 AM", "6:59 AM", "1:36 PM", "5:15 PM", "8:08 PM", "9:18 PM"],
  // March (days 60-90)
  ["5:31 AM", "7:01 AM", "1:35 PM", "5:14 PM", "8:05 PM", "9:15 PM"],
  ["5:33 AM", "7:02 AM", "1:35 PM", "5:13 PM", "8:04 PM", "9:13 PM"],
  ["5:34 AM", "7:03 AM", "1:35 PM", "5:12 PM", "8:02 PM", "9:11 PM"],
  ["5:35 AM", "7:04 AM", "1:35 PM", "5:12 PM", "8:01 PM", "9:10 PM"],
  ["5:36 AM", "7:05 AM", "1:35 PM", "5:11 PM", "7:59 PM", "9:08 PM"],
  ["5:38 AM", "7:06 AM", "1:34 PM", "5:10 PM", "7:58 PM", "9:07 PM"],
  ["5:39 AM", "7:07 AM", "1:34 PM", "5:09 PM", "7:57 PM", "9:05 PM"],
  ["5:40 AM", "7:08 AM", "1:34 PM", "5:08 PM", "7:55 PM", "9:03 PM"],
  ["5:41 AM", "7:09 AM", "1:34 PM", "5:07 PM", "7:54 PM", "9:02 PM"],
  ["5:42 AM", "7:10 AM", "1:33 PM", "5:07 PM", "7:52 PM", "9:00 PM"],
  ["5:43 AM", "7:11 AM", "1:33 PM", "5:06 PM", "7:51 PM", "8:58 PM"],
  ["5:45 AM", "7:12 AM", "1:33 PM", "5:05 PM", "7:49 PM", "8:57 PM"],
  ["5:46 AM", "7:13 AM", "1:33 PM", "5:04 PM", "7:48 PM", "8:55 PM"],
  ["5:47 AM", "7:14 AM", "1:32 PM", "5:03 PM", "7:46 PM", "8:54 PM"],
  ["5:48 AM", "7:15 AM", "1:32 PM", "5:02 PM", "7:44 PM", "8:52 PM"],
  ["5:49 AM", "7:16 AM", "1:32 PM", "5:01 PM", "7:43 PM", "8:50 PM"],
  ["5:50 AM", "7:17 AM", "1:31 PM", "5:00 PM", "7:41 PM", "8:49 PM"],
  ["5:51 AM", "7:17 AM", "1:31 PM", "4:59 PM", "7:40 PM", "8:47 PM"],
  ["5:52 AM", "7:18 AM", "1:31 PM", "4:58 PM", "7:38 PM", "8:46 PM"],
  ["5:53 AM", "7:19 AM", "1:31 PM", "4:57 PM", "7:37 PM", "8:44 PM"],
  ["5:54 AM", "7:20 AM", "1:30 PM", "4:56 PM", "7:35 PM", "8:42 PM"],
  ["5:55 AM", "7:21 AM", "1:30 PM", "4:55 PM", "7:34 PM", "8:41 PM"],
  ["5:56 AM", "7:22 AM", "1:30 PM", "4:54 PM", "7:32 PM", "8:39 PM"],
  ["5:57 AM", "7:23 AM", "1:29 PM", "4:53 PM", "7:31 PM", "8:38 PM"],
  ["5:58 AM", "7:24 AM", "1:29 PM", "4:52 PM", "7:29 PM", "8:36 PM"],
  ["5:59 AM", "7:25 AM", "1:29 PM", "4:51 PM", "7:28 PM", "8:34 PM"],
  ["6:00 AM", "7:26 AM", "1:28 PM", "4:50 PM", "7:26 PM", "8:33 PM"],
  ["6:01 AM", "7:27 AM", "1:28 PM", "4:49 PM", "7:25 PM", "8:31 PM"],
  ["6:02 AM", "7:28 AM", "1:28 PM", "4:47 PM", "7:23 PM", "8:30 PM"],
  ["6:03 AM", "7:29 AM", "1:28 PM", "4:46 PM", "7:21 PM", "8:28 PM"],
  ["6:04 AM", "7:29 AM", "1:27 PM", "4:45 PM", "7:20 PM", "8:27 PM"],
  // April (days 91-120) - DST ends first Sunday of April
  ["5:05 AM", "6:30 AM", "12:27 PM", "3:44 PM", "6:18 PM", "7:25 PM"],
  ["5:06 AM", "6:31 AM", "12:27 PM", "3:43 PM", "6:17 PM", "7:24 PM"],
  ["5:07 AM", "6:32 AM", "12:26 PM", "3:42 PM", "6:15 PM", "7:22 PM"],
  ["5:08 AM", "6:33 AM", "12:26 PM", "3:41 PM", "6:14 PM", "7:21 PM"],
  ["5:09 AM", "6:34 AM", "12:26 PM", "3:40 PM", "6:12 PM", "7:19 PM"],
  ["5:10 AM", "6:35 AM", "12:26 PM", "3:39 PM", "6:11 PM", "7:18 PM"],
  ["5:11 AM", "6:36 AM", "12:25 PM", "3:38 PM", "6:09 PM", "7:16 PM"],
  ["5:11 AM", "6:37 AM", "12:25 PM", "3:37 PM", "6:08 PM", "7:15 PM"],
  ["5:12 AM", "6:38 AM", "12:25 PM", "3:35 PM", "6:07 PM", "7:14 PM"],
  ["5:13 AM", "6:38 AM", "12:24 PM", "3:34 PM", "6:05 PM", "7:12 PM"],
  ["5:14 AM", "6:39 AM", "12:24 PM", "3:33 PM", "6:04 PM", "7:11 PM"],
  ["5:15 AM", "6:40 AM", "12:24 PM", "3:32 PM", "6:02 PM", "7:10 PM"],
  ["5:16 AM", "6:41 AM", "12:24 PM", "3:31 PM", "6:01 PM", "7:08 PM"],
  ["5:17 AM", "6:42 AM", "12:23 PM", "3:30 PM", "5:59 PM", "7:07 PM"],
  ["5:17 AM", "6:43 AM", "12:23 PM", "3:29 PM", "5:58 PM", "7:05 PM"],
  ["5:18 AM", "6:44 AM", "12:23 PM", "3:28 PM", "5:57 PM", "7:04 PM"],
  ["5:19 AM", "6:45 AM", "12:23 PM", "3:27 PM", "5:55 PM", "7:03 PM"],
  ["5:20 AM", "6:46 AM", "12:22 PM", "3:26 PM", "5:54 PM", "7:02 PM"],
  ["5:21 AM", "6:47 AM", "12:22 PM", "3:25 PM", "5:52 PM", "7:00 PM"],
  ["5:22 AM", "6:47 AM", "12:22 PM", "3:24 PM", "5:51 PM", "6:59 PM"],
  ["5:22 AM", "6:48 AM", "12:22 PM", "3:23 PM", "5:50 PM", "6:58 PM"],
  ["5:23 AM", "6:49 AM", "12:22 PM", "3:22 PM", "5:49 PM", "6:57 PM"],
  ["5:24 AM", "6:50 AM", "12:21 PM", "3:20 PM", "5:47 PM", "6:55 PM"],
  ["5:25 AM", "6:51 AM", "12:21 PM", "3:19 PM", "5:46 PM", "6:54 PM"],
  ["5:26 AM", "6:52 AM", "12:21 PM", "3:18 PM", "5:45 PM", "6:53 PM"],
  ["5:26 AM", "6:53 AM", "12:21 PM", "3:17 PM", "5:43 PM", "6:52 PM"],
  ["5:27 AM", "6:54 AM", "12:21 PM", "3:16 PM", "5:42 PM", "6:51 PM"],
  ["5:28 AM", "6:55 AM", "12:21 PM", "3:16 PM", "5:41 PM", "6:50 PM"],
  ["5:29 AM", "6:56 AM", "12:20 PM", "3:15 PM", "5:40 PM", "6:49 PM"],
  ["5:30 AM", "6:56 AM", "12:20 PM", "3:14 PM", "5:39 PM", "6:48 PM"],
  // May (days 121-151)
  ["5:30 AM", "6:57 AM", "12:20 PM", "3:13 PM", "5:38 PM", "6:47 PM"],
  ["5:31 AM", "6:58 AM", "12:20 PM", "3:12 PM", "5:36 PM", "6:46 PM"],
  ["5:32 AM", "6:59 AM", "12:20 PM", "3:11 PM", "5:35 PM", "6:45 PM"],
  ["5:33 AM", "7:00 AM", "12:20 PM", "3:10 PM", "5:34 PM", "6:44 PM"],
  ["5:33 AM", "7:01 AM", "12:20 PM", "3:09 PM", "5:33 PM", "6:43 PM"],
  ["5:34 AM", "7:02 AM", "12:20 PM", "3:08 PM", "5:32 PM", "6:42 PM"],
  ["5:35 AM", "7:03 AM", "12:20 PM", "3:07 PM", "5:31 PM", "6:41 PM"],
  ["5:36 AM", "7:04 AM", "12:20 PM", "3:07 PM", "5:30 PM", "6:40 PM"],
  ["5:36 AM", "7:04 AM", "12:20 PM", "3:06 PM", "5:29 PM", "6:39 PM"],
  ["5:37 AM", "7:05 AM", "12:19 PM", "3:05 PM", "5:28 PM", "6:38 PM"],
  ["5:38 AM", "7:06 AM", "12:19 PM", "3:04 PM", "5:27 PM", "6:38 PM"],
  ["5:39 AM", "7:07 AM", "12:19 PM", "3:03 PM", "5:26 PM", "6:37 PM"],
  ["5:39 AM", "7:08 AM", "12:19 PM", "3:03 PM", "5:25 PM", "6:36 PM"],
  ["5:40 AM", "7:09 AM", "12:19 PM", "3:02 PM", "5:25 PM", "6:35 PM"],
  ["5:41 AM", "7:10 AM", "12:19 PM", "3:01 PM", "5:24 PM", "6:35 PM"],
  ["5:41 AM", "7:10 AM", "12:19 PM", "3:01 PM", "5:23 PM", "6:34 PM"],
  ["5:42 AM", "7:11 AM", "12:19 PM", "3:00 PM", "5:22 PM", "6:33 PM"],
  ["5:43 AM", "7:12 AM", "12:19 PM", "2:59 PM", "5:21 PM", "6:33 PM"],
  ["5:43 AM", "7:13 AM", "12:20 PM", "2:59 PM", "5:21 PM", "6:32 PM"],
  ["5:44 AM", "7:14 AM", "12:20 PM", "2:58 PM", "5:20 PM", "6:32 PM"],
  ["5:45 AM", "7:15 AM", "12:20 PM", "2:58 PM", "5:19 PM", "6:31 PM"],
  ["5:45 AM", "7:15 AM", "12:20 PM", "2:57 PM", "5:19 PM", "6:31 PM"],
  ["5:46 AM", "7:16 AM", "12:20 PM", "2:57 PM", "5:18 PM", "6:30 PM"],
  ["5:47 AM", "7:17 AM", "12:20 PM", "2:56 PM", "5:17 PM", "6:30 PM"],
  ["5:47 AM", "7:18 AM", "12:20 PM", "2:56 PM", "5:17 PM", "6:29 PM"],
  ["5:48 AM", "7:18 AM", "12:20 PM", "2:55 PM", "5:16 PM", "6:29 PM"],
  ["5:49 AM", "7:19 AM", "12:20 PM", "2:55 PM", "5:16 PM", "6:28 PM"],
  ["5:49 AM", "7:20 AM", "12:20 PM", "2:54 PM", "5:15 PM", "6:28 PM"],
  ["5:50 AM", "7:21 AM", "12:20 PM", "2:54 PM", "5:15 PM", "6:28 PM"],
  ["5:50 AM", "7:21 AM", "12:21 PM", "2:54 PM", "5:14 PM", "6:27 PM"],
  ["5:51 AM", "7:22 AM", "12:21 PM", "2:53 PM", "5:14 PM", "6:27 PM"],
  // June (days 152-181)
  ["5:51 AM", "7:23 AM", "12:21 PM", "2:53 PM", "5:14 PM", "6:27 PM"],
  ["5:52 AM", "7:23 AM", "12:21 PM", "2:53 PM", "5:13 PM", "6:27 PM"],
  ["5:53 AM", "7:24 AM", "12:21 PM", "2:53 PM", "5:13 PM", "6:26 PM"],
  ["5:53 AM", "7:24 AM", "12:21 PM", "2:53 PM", "5:13 PM", "6:26 PM"],
  ["5:54 AM", "7:25 AM", "12:22 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:54 AM", "7:26 AM", "12:22 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:55 AM", "7:26 AM", "12:22 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:55 AM", "7:27 AM", "12:22 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:56 AM", "7:27 AM", "12:22 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:56 AM", "7:28 AM", "12:23 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:56 AM", "7:28 AM", "12:23 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:57 AM", "7:29 AM", "12:23 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:57 AM", "7:29 AM", "12:23 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:58 AM", "7:30 AM", "12:23 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:58 AM", "7:30 AM", "12:24 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:58 AM", "7:30 AM", "12:24 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:58 AM", "7:31 AM", "12:24 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:59 AM", "7:31 AM", "12:24 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:59 AM", "7:31 AM", "12:24 PM", "2:52 PM", "5:12 PM", "6:26 PM"],
  ["5:59 AM", "7:31 AM", "12:25 PM", "2:53 PM", "5:12 PM", "6:26 PM"],
  ["6:00 AM", "7:32 AM", "12:25 PM", "2:53 PM", "5:12 PM", "6:27 PM"],
  ["6:00 AM", "7:32 AM", "12:25 PM", "2:53 PM", "5:13 PM", "6:27 PM"],
  ["6:00 AM", "7:32 AM", "12:25 PM", "2:53 PM", "5:13 PM", "6:27 PM"],
  ["6:00 AM", "7:32 AM", "12:25 PM", "2:54 PM", "5:13 PM", "6:27 PM"],
  ["6:00 AM", "7:32 AM", "12:26 PM", "2:54 PM", "5:14 PM", "6:28 PM"],
  ["6:00 AM", "7:32 AM", "12:26 PM", "2:54 PM", "5:14 PM", "6:28 PM"],
  ["6:00 AM", "7:33 AM", "12:26 PM", "2:55 PM", "5:14 PM", "6:28 PM"],
  ["6:01 AM", "7:33 AM", "12:26 PM", "2:55 PM", "5:15 PM", "6:29 PM"],
  ["6:01 AM", "7:33 AM", "12:27 PM", "2:55 PM", "5:15 PM", "6:29 PM"],
  ["6:01 AM", "7:33 AM", "12:27 PM", "2:56 PM", "5:15 PM", "6:29 PM"],
  // July (days 182-212)
  ["6:01 AM", "7:33 AM", "12:27 PM", "2:56 PM", "5:16 PM", "6:30 PM"],
  ["6:01 AM", "7:32 AM", "12:27 PM", "2:57 PM", "5:16 PM", "6:30 PM"],
  ["6:01 AM", "7:32 AM", "12:27 PM", "2:57 PM", "5:17 PM", "6:31 PM"],
  ["6:01 AM", "7:32 AM", "12:27 PM", "2:57 PM", "5:17 PM", "6:31 PM"],
  ["6:00 AM", "7:32 AM", "12:28 PM", "2:58 PM", "5:18 PM", "6:32 PM"],
  ["6:00 AM", "7:32 AM", "12:28 PM", "2:58 PM", "5:18 PM", "6:32 PM"],
  ["6:00 AM", "7:32 AM", "12:28 PM", "2:59 PM", "5:19 PM", "6:33 PM"],
  ["6:00 AM", "7:31 AM", "12:28 PM", "2:59 PM", "5:20 PM", "6:33 PM"],
  ["6:00 AM", "7:31 AM", "12:28 PM", "3:00 PM", "5:20 PM", "6:34 PM"],
  ["6:00 AM", "7:31 AM", "12:28 PM", "3:01 PM", "5:21 PM", "6:34 PM"],
  ["5:59 AM", "7:30 AM", "12:29 PM", "3:01 PM", "5:21 PM", "6:35 PM"],
  ["5:59 AM", "7:30 AM", "12:29 PM", "3:02 PM", "5:22 PM", "6:35 PM"],
  ["5:59 AM", "7:30 AM", "12:29 PM", "3:02 PM", "5:23 PM", "6:36 PM"],
  ["5:59 AM", "7:29 AM", "12:29 PM", "3:03 PM", "5:23 PM", "6:36 PM"],
  ["5:58 AM", "7:29 AM", "12:29 PM", "3:03 PM", "5:24 PM", "6:37 PM"],
  ["5:58 AM", "7:28 AM", "12:29 PM", "3:04 PM", "5:25 PM", "6:37 PM"],
  ["5:57 AM", "7:28 AM", "12:29 PM", "3:05 PM", "5:26 PM", "6:38 PM"],
  ["5:57 AM", "7:27 AM", "12:29 PM", "3:05 PM", "5:26 PM", "6:39 PM"],
  ["5:57 AM", "7:27 AM", "12:29 PM", "3:06 PM", "5:27 PM", "6:39 PM"],
  ["5:56 AM", "7:26 AM", "12:29 PM", "3:07 PM", "5:28 PM", "6:40 PM"],
  ["5:56 AM", "7:25 AM", "12:29 PM", "3:07 PM", "5:29 PM", "6:41 PM"],
  ["5:55 AM", "7:25 AM", "12:30 PM", "3:08 PM", "5:29 PM", "6:41 PM"],
  ["5:54 AM", "7:24 AM", "12:30 PM", "3:08 PM", "5:30 PM", "6:42 PM"],
  ["5:54 AM", "7:23 AM", "12:30 PM", "3:09 PM", "5:31 PM", "6:42 PM"],
  ["5:53 AM", "7:23 AM", "12:30 PM", "3:10 PM", "5:32 PM", "6:43 PM"],
  ["5:53 AM", "7:22 AM", "12:30 PM", "3:10 PM", "5:32 PM", "6:44 PM"],
  ["5:52 AM", "7:21 AM", "12:30 PM", "3:11 PM", "5:33 PM", "6:44 PM"],
  ["5:51 AM", "7:20 AM", "12:30 PM", "3:12 PM", "5:34 PM", "6:45 PM"],
  ["5:51 AM", "7:19 AM", "12:30 PM", "3:12 PM", "5:35 PM", "6:46 PM"],
  ["5:50 AM", "7:18 AM", "12:30 PM", "3:13 PM", "5:36 PM", "6:47 PM"],
  ["5:49 AM", "7:18 AM", "12:29 PM", "3:14 PM", "5:37 PM", "6:47 PM"],
  // August (days 213-243)
  ["5:48 AM", "7:17 AM", "12:29 PM", "3:14 PM", "5:37 PM", "6:48 PM"],
  ["5:47 AM", "7:16 AM", "12:29 PM", "3:15 PM", "5:38 PM", "6:49 PM"],
  ["5:47 AM", "7:15 AM", "12:29 PM", "3:16 PM", "5:39 PM", "6:49 PM"],
  ["5:46 AM", "7:14 AM", "12:29 PM", "3:16 PM", "5:40 PM", "6:50 PM"],
  ["5:45 AM", "7:13 AM", "12:29 PM", "3:17 PM", "5:41 PM", "6:51 PM"],
  ["5:44 AM", "7:12 AM", "12:29 PM", "3:18 PM", "5:42 PM", "6:51 PM"],
  ["5:43 AM", "7:11 AM", "12:29 PM", "3:18 PM", "5:42 PM", "6:52 PM"],
  ["5:42 AM", "7:10 AM", "12:29 PM", "3:19 PM", "5:43 PM", "6:53 PM"],
  ["5:41 AM", "7:08 AM", "12:29 PM", "3:20 PM", "5:44 PM", "6:54 PM"],
  ["5:40 AM", "7:07 AM", "12:28 PM", "3:20 PM", "5:45 PM", "6:54 PM"],
  ["5:39 AM", "7:06 AM", "12:28 PM", "3:21 PM", "5:46 PM", "6:55 PM"],
  ["5:38 AM", "7:05 AM", "12:28 PM", "3:22 PM", "5:47 PM", "6:56 PM"],
  ["5:37 AM", "7:04 AM", "12:28 PM", "3:22 PM", "5:47 PM", "6:57 PM"],
  ["5:36 AM", "7:03 AM", "12:28 PM", "3:23 PM", "5:48 PM", "6:57 PM"],
  ["5:35 AM", "7:01 AM", "12:28 PM", "3:24 PM", "5:49 PM", "6:58 PM"],
  ["5:34 AM", "7:00 AM", "12:27 PM", "3:24 PM", "5:50 PM", "6:59 PM"],
  ["5:33 AM", "6:59 AM", "12:27 PM", "3:25 PM", "5:51 PM", "6:59 PM"],
  ["5:31 AM", "6:58 AM", "12:27 PM", "3:25 PM", "5:52 PM", "7:00 PM"],
  ["5:30 AM", "6:56 AM", "12:27 PM", "3:26 PM", "5:53 PM", "7:01 PM"],
  ["5:29 AM", "6:55 AM", "12:26 PM", "3:27 PM", "5:53 PM", "7:02 PM"],
  ["5:28 AM", "6:54 AM", "12:26 PM", "3:27 PM", "5:54 PM", "7:02 PM"],
  ["5:27 AM", "6:52 AM", "12:26 PM", "3:28 PM", "5:55 PM", "7:03 PM"],
  ["5:25 AM", "6:51 AM", "12:26 PM", "3:28 PM", "5:56 PM", "7:04 PM"],
  ["5:24 AM", "6:50 AM", "12:25 PM", "3:29 PM", "5:57 PM", "7:05 PM"],
  ["5:23 AM", "6:48 AM", "12:25 PM", "3:29 PM", "5:58 PM", "7:05 PM"],
  ["5:21 AM", "6:47 AM", "12:25 PM", "3:30 PM", "5:59 PM", "7:06 PM"],
  ["5:20 AM", "6:46 AM", "12:25 PM", "3:30 PM", "5:59 PM", "7:07 PM"],
  ["5:19 AM", "6:44 AM", "12:24 PM", "3:31 PM", "6:00 PM", "7:08 PM"],
  ["5:17 AM", "6:43 AM", "12:24 PM", "3:32 PM", "6:01 PM", "7:09 PM"],
  ["5:16 AM", "6:41 AM", "12:24 PM", "3:32 PM", "6:02 PM", "7:09 PM"],
  ["5:15 AM", "6:40 AM", "12:23 PM", "3:33 PM", "6:03 PM", "7:10 PM"],
  // September (days 244-273)
  ["5:13 AM", "6:38 AM", "12:23 PM", "3:33 PM", "6:04 PM", "7:11 PM"],
  ["5:12 AM", "6:37 AM", "12:23 PM", "3:34 PM", "6:05 PM", "7:12 PM"],
  ["5:10 AM", "6:35 AM", "12:22 PM", "3:34 PM", "6:05 PM", "7:13 PM"],
  ["5:09 AM", "6:34 AM", "12:22 PM", "3:35 PM", "6:06 PM", "7:13 PM"],
  ["5:07 AM", "6:32 AM", "12:22 PM", "3:35 PM", "6:07 PM", "7:14 PM"],
  ["5:06 AM", "6:31 AM", "12:21 PM", "3:36 PM", "6:08 PM", "7:15 PM"],
  ["5:04 AM", "6:29 AM", "12:21 PM", "3:36 PM", "6:09 PM", "7:16 PM"],
  ["5:03 AM", "6:28 AM", "12:21 PM", "3:36 PM", "6:10 PM", "7:17 PM"],
  ["5:01 AM", "6:26 AM", "12:20 PM", "3:37 PM", "6:10 PM", "7:17 PM"],
  ["5:00 AM", "6:25 AM", "12:20 PM", "3:37 PM", "6:11 PM", "7:18 PM"],
  ["4:58 AM", "6:23 AM", "12:20 PM", "3:38 PM", "6:12 PM", "7:19 PM"],
  ["4:57 AM", "6:22 AM", "12:19 PM", "3:38 PM", "6:13 PM", "7:20 PM"],
  ["4:55 AM", "6:20 AM", "12:19 PM", "3:39 PM", "6:14 PM", "7:21 PM"],
  ["4:53 AM", "6:19 AM", "12:19 PM", "3:39 PM", "6:15 PM", "7:22 PM"],
  ["4:52 AM", "6:17 AM", "12:18 PM", "3:39 PM", "6:16 PM", "7:23 PM"],
  ["4:50 AM", "6:16 AM", "12:18 PM", "3:40 PM", "6:16 PM", "7:23 PM"],
  ["4:49 AM", "6:14 AM", "12:18 PM", "3:40 PM", "6:17 PM", "7:24 PM"],
  ["4:47 AM", "6:12 AM", "12:17 PM", "3:41 PM", "6:18 PM", "7:25 PM"],
  ["4:45 AM", "6:11 AM", "12:17 PM", "3:41 PM", "6:19 PM", "7:26 PM"],
  ["4:44 AM", "6:09 AM", "12:17 PM", "3:41 PM", "6:20 PM", "7:27 PM"],
  ["4:42 AM", "6:08 AM", "12:16 PM", "3:42 PM", "6:21 PM", "7:28 PM"],
  ["4:40 AM", "6:06 AM", "12:16 PM", "3:42 PM", "6:22 PM", "7:29 PM"],
  ["4:39 AM", "6:05 AM", "12:15 PM", "3:42 PM", "6:22 PM", "7:30 PM"],
  ["4:37 AM", "6:03 AM", "12:15 PM", "3:43 PM", "6:23 PM", "7:31 PM"],
  ["4:35 AM", "6:02 AM", "12:15 PM", "3:43 PM", "6:24 PM", "7:32 PM"],
  ["4:34 AM", "6:00 AM", "12:14 PM", "3:43 PM", "6:25 PM", "7:33 PM"],
  ["4:32 AM", "5:58 AM", "12:14 PM", "3:44 PM", "6:26 PM", "7:34 PM"],
  ["4:30 AM", "5:57 AM", "12:14 PM", "3:44 PM", "6:27 PM", "7:35 PM"],
  ["4:29 AM", "5:55 AM", "12:13 PM", "3:44 PM", "6:28 PM", "7:36 PM"],
  ["4:27 AM", "5:54 AM", "12:13 PM", "3:45 PM", "6:29 PM", "7:37 PM"],
  // October (days 274-304) - DST starts first Sunday of October
  ["5:25 AM", "6:52 AM", "1:13 PM", "4:45 PM", "7:30 PM", "8:38 PM"],
  ["5:24 AM", "6:51 AM", "1:12 PM", "4:45 PM", "7:31 PM", "8:39 PM"],
  ["5:22 AM", "6:49 AM", "1:12 PM", "4:46 PM", "7:31 PM", "8:40 PM"],
  ["5:20 AM", "6:48 AM", "1:12 PM", "4:46 PM", "7:32 PM", "8:41 PM"],
  ["5:19 AM", "6:46 AM", "1:12 PM", "4:46 PM", "7:33 PM", "8:42 PM"],
  ["5:17 AM", "6:45 AM", "1:11 PM", "4:47 PM", "7:34 PM", "8:43 PM"],
  ["5:15 AM", "6:43 AM", "1:11 PM", "4:47 PM", "7:35 PM", "8:44 PM"],
  ["5:13 AM", "6:42 AM", "1:11 PM", "4:47 PM", "7:36 PM", "8:45 PM"],
  ["5:12 AM", "6:40 AM", "1:10 PM", "4:48 PM", "7:37 PM", "8:46 PM"],
  ["5:10 AM", "6:39 AM", "1:10 PM", "4:48 PM", "7:38 PM", "8:47 PM"],
  ["5:08 AM", "6:37 AM", "1:10 PM", "4:48 PM", "7:39 PM", "8:48 PM"],
  ["5:07 AM", "6:36 AM", "1:10 PM", "4:48 PM", "7:40 PM", "8:49 PM"],
  ["5:05 AM", "6:34 AM", "1:09 PM", "4:49 PM", "7:41 PM", "8:51 PM"],
  ["5:03 AM", "6:33 AM", "1:09 PM", "4:49 PM", "7:42 PM", "8:52 PM"],
  ["5:01 AM", "6:32 AM", "1:09 PM", "4:49 PM", "7:43 PM", "8:53 PM"],
  ["5:00 AM", "6:30 AM", "1:09 PM", "4:50 PM", "7:44 PM", "8:54 PM"],
  ["4:58 AM", "6:29 AM", "1:08 PM", "4:50 PM", "7:45 PM", "8:55 PM"],
  ["4:56 AM", "6:27 AM", "1:08 PM", "4:50 PM", "7:46 PM", "8:56 PM"],
  ["4:55 AM", "6:26 AM", "1:08 PM", "4:50 PM", "7:47 PM", "8:58 PM"],
  ["4:53 AM", "6:25 AM", "1:08 PM", "4:51 PM", "7:48 PM", "8:59 PM"],
  ["4:51 AM", "6:23 AM", "1:08 PM", "4:51 PM", "7:49 PM", "9:00 PM"],
  ["4:50 AM", "6:22 AM", "1:08 PM", "4:51 PM", "7:50 PM", "9:01 PM"],
  ["4:48 AM", "6:21 AM", "1:07 PM", "4:52 PM", "7:51 PM", "9:03 PM"],
  ["4:47 AM", "6:19 AM", "1:07 PM", "4:52 PM", "7:52 PM", "9:04 PM"],
  ["4:45 AM", "6:18 AM", "1:07 PM", "4:52 PM", "7:53 PM", "9:05 PM"],
  ["4:43 AM", "6:17 AM", "1:07 PM", "4:53 PM", "7:54 PM", "9:07 PM"],
  ["4:42 AM", "6:16 AM", "1:07 PM", "4:53 PM", "7:55 PM", "9:08 PM"],
  ["4:40 AM", "6:14 AM", "1:07 PM", "4:53 PM", "7:56 PM", "9:09 PM"],
  ["4:39 AM", "6:13 AM", "1:07 PM", "4:53 PM", "7:57 PM", "9:11 PM"],
  ["4:37 AM", "6:12 AM", "1:07 PM", "4:54 PM", "7:58 PM", "9:12 PM"],
  ["4:35 AM", "6:11 AM", "1:07 PM", "4:54 PM", "7:59 PM", "9:13 PM"],
  // November (days 305-334)
  ["4:34 AM", "6:10 AM", "1:07 PM", "4:54 PM", "8:01 PM", "9:15 PM"],
  ["4:32 AM", "6:09 AM", "1:07 PM", "4:55 PM", "8:02 PM", "9:16 PM"],
  ["4:31 AM", "6:07 AM", "1:07 PM", "4:55 PM", "8:03 PM", "9:17 PM"],
  ["4:29 AM", "6:06 AM", "1:07 PM", "4:55 PM", "8:04 PM", "9:19 PM"],
  ["4:28 AM", "6:05 AM", "1:07 PM", "4:56 PM", "8:05 PM", "9:20 PM"],
  ["4:26 AM", "6:04 AM", "1:07 PM", "4:56 PM", "8:06 PM", "9:22 PM"],
  ["4:25 AM", "6:03 AM", "1:07 PM", "4:56 PM", "8:07 PM", "9:23 PM"],
  ["4:24 AM", "6:02 AM", "1:07 PM", "4:57 PM", "8:08 PM", "9:24 PM"],
  ["4:22 AM", "6:01 AM", "1:07 PM", "4:57 PM", "8:09 PM", "9:26 PM"],
  ["4:21 AM", "6:00 AM", "1:07 PM", "4:57 PM", "8:10 PM", "9:27 PM"],
  ["4:20 AM", "6:00 AM", "1:07 PM", "4:58 PM", "8:12 PM", "9:29 PM"],
  ["4:18 AM", "5:59 AM", "1:07 PM", "4:58 PM", "8:13 PM", "9:30 PM"],
  ["4:17 AM", "5:58 AM", "1:07 PM", "4:59 PM", "8:14 PM", "9:31 PM"],
  ["4:16 AM", "5:57 AM", "1:08 PM", "4:59 PM", "8:15 PM", "9:33 PM"],
  ["4:14 AM", "5:56 AM", "1:08 PM", "4:59 PM", "8:16 PM", "9:34 PM"],
  ["4:13 AM", "5:55 AM", "1:08 PM", "5:00 PM", "8:17 PM", "9:36 PM"],
  ["4:12 AM", "5:55 AM", "1:08 PM", "5:00 PM", "8:18 PM", "9:37 PM"],
  ["4:11 AM", "5:54 AM", "1:08 PM", "5:00 PM", "8:19 PM", "9:39 PM"],
  ["4:10 AM", "5:53 AM", "1:08 PM", "5:01 PM", "8:20 PM", "9:40 PM"],
  ["4:09 AM", "5:53 AM", "1:09 PM", "5:01 PM", "8:22 PM", "9:41 PM"],
  ["4:08 AM", "5:52 AM", "1:09 PM", "5:02 PM", "8:23 PM", "9:43 PM"],
  ["4:07 AM", "5:52 AM", "1:09 PM", "5:02 PM", "8:24 PM", "9:44 PM"],
  ["4:06 AM", "5:51 AM", "1:09 PM", "5:03 PM", "8:25 PM", "9:46 PM"],
  ["4:05 AM", "5:51 AM", "1:10 PM", "5:03 PM", "8:26 PM", "9:47 PM"],
  ["4:04 AM", "5:50 AM", "1:10 PM", "5:03 PM", "8:27 PM", "9:48 PM"],
  ["4:03 AM", "5:50 AM", "1:10 PM", "5:04 PM", "8:28 PM", "9:50 PM"],
  ["4:03 AM", "5:50 AM", "1:10 PM", "5:04 PM", "8:29 PM", "9:52 PM"],
  ["4:03 AM", "5:50 AM", "1:11 PM", "5:05 PM", "8:30 PM", "9:53 PM"],
  ["4:02 AM", "5:49 AM", "1:11 PM", "5:05 PM", "8:31 PM", "9:54 PM"],
  ["4:02 AM", "5:49 AM", "1:12 PM", "5:06 PM", "8:32 PM", "9:56 PM"],
  // December (days 335-365)
  ["4:01 AM", "5:49 AM", "1:12 PM", "5:06 PM", "8:33 PM", "9:57 PM"],
  ["4:01 AM", "5:48 AM", "1:13 PM", "5:07 PM", "8:34 PM", "9:58 PM"],
  ["4:00 AM", "5:48 AM", "1:13 PM", "5:07 PM", "8:35 PM", "9:59 PM"],
  ["4:00 AM", "5:48 AM", "1:14 PM", "5:08 PM", "8:36 PM", "10:00 PM"],
  ["3:59 AM", "5:48 AM", "1:14 PM", "5:08 PM", "8:37 PM", "10:01 PM"],
  ["3:59 AM", "5:48 AM", "1:14 PM", "5:09 PM", "8:38 PM", "10:02 PM"],
  ["3:57 AM", "5:47 AM", "1:15 PM", "5:09 PM", "8:39 PM", "10:03 PM"],
  ["3:56 AM", "5:47 AM", "1:15 PM", "5:10 PM", "8:39 PM", "10:04 PM"],
  ["3:56 AM", "5:47 AM", "1:15 PM", "5:10 PM", "8:40 PM", "10:05 PM"],
  ["3:56 AM", "5:47 AM", "1:16 PM", "5:11 PM", "8:41 PM", "10:06 PM"],
  ["3:56 AM", "5:47 AM", "1:16 PM", "5:11 PM", "8:42 PM", "10:07 PM"],
  ["3:56 AM", "5:48 AM", "1:17 PM", "5:12 PM", "8:43 PM", "10:08 PM"],
  ["3:56 AM", "5:48 AM", "1:17 PM", "5:12 PM", "8:43 PM", "10:09 PM"],
  ["3:56 AM", "5:48 AM", "1:18 PM", "5:13 PM", "8:44 PM", "10:09 PM"],
  ["3:56 AM", "5:48 AM", "1:18 PM", "5:13 PM", "8:45 PM", "10:10 PM"],
  ["3:56 AM", "5:49 AM", "1:19 PM", "5:14 PM", "8:46 PM", "10:11 PM"],
  ["3:56 AM", "5:49 AM", "1:19 PM", "5:14 PM", "8:46 PM", "10:12 PM"],
  ["3:56 AM", "5:49 AM", "1:20 PM", "5:15 PM", "8:47 PM", "10:12 PM"],
  ["3:57 AM", "5:50 AM", "1:20 PM", "5:15 PM", "8:47 PM", "10:13 PM"],
  ["3:57 AM", "5:50 AM", "1:21 PM", "5:16 PM", "8:48 PM", "10:14 PM"],
  ["3:58 AM", "5:51 AM", "1:21 PM", "5:16 PM", "8:48 PM", "10:14 PM"],
  ["3:58 AM", "5:51 AM", "1:22 PM", "5:17 PM", "8:49 PM", "10:15 PM"],
  ["3:59 AM", "5:52 AM", "1:22 PM", "5:17 PM", "8:49 PM", "10:15 PM"],
  ["3:59 AM", "5:52 AM", "1:23 PM", "5:18 PM", "8:50 PM", "10:15 PM"],
  ["4:00 AM", "5:53 AM", "1:23 PM", "5:18 PM", "8:50 PM", "10:16 PM"],
  ["4:00 AM", "5:53 AM", "1:24 PM", "5:18 PM", "8:51 PM", "10:16 PM"],
  ["4:01 AM", "5:54 AM", "1:24 PM", "5:19 PM", "8:51 PM", "10:16 PM"],
  ["4:02 AM", "5:55 AM", "1:25 PM", "5:19 PM", "8:51 PM", "10:16 PM"],
  ["4:03 AM", "5:55 AM", "1:25 PM", "5:20 PM", "8:51 PM", "10:17 PM"],
  ["4:04 AM", "5:56 AM", "1:26 PM", "5:20 PM", "8:52 PM", "10:17 PM"],
  ["4:05 AM", "5:57 AM", "1:26 PM", "5:21 PM", "8:52 PM", "10:17 PM"],
  // Special days for leap year and DST transitions
  // Index 366: Feb 29 (leap year)
  ["5:30 AM", "7:00 AM", "1:36 PM", "5:15 PM", "8:07 PM", "9:16 PM"],
  // Index 367-374: April DST transition period (days 91-98 when DST is still on)
  ["6:05 AM", "7:30 AM", "1:27 PM", "4:44 PM", "7:18 PM", "8:25 PM"],
  ["6:06 AM", "7:31 AM", "1:27 PM", "4:43 PM", "7:17 PM", "8:24 PM"],
  ["6:07 AM", "7:32 AM", "1:26 PM", "4:42 PM", "7:15 PM", "8:22 PM"],
  ["6:08 AM", "7:33 AM", "1:26 PM", "4:41 PM", "7:14 PM", "8:21 PM"],
  ["6:09 AM", "7:34 AM", "1:26 PM", "4:40 PM", "7:12 PM", "8:19 PM"],
  ["6:10 AM", "7:35 AM", "1:26 PM", "4:39 PM", "7:11 PM", "8:18 PM"],
  ["6:11 AM", "7:36 AM", "1:25 PM", "4:38 PM", "7:09 PM", "8:16 PM"],
  ["6:11 AM", "7:37 AM", "1:25 PM", "4:37 PM", "7:08 PM", "8:15 PM"],
  // Index 375-382: October DST transition period (days 274-281 when DST is off)
  ["4:25 AM", "5:52 AM", "12:13 PM", "3:45 PM", "6:30 PM", "7:38 PM"],
  ["4:24 AM", "5:51 AM", "12:12 PM", "3:45 PM", "6:31 PM", "7:39 PM"],
  ["4:22 AM", "5:49 AM", "12:12 PM", "3:46 PM", "6:31 PM", "7:40 PM"],
  ["4:20 AM", "5:48 AM", "12:12 PM", "3:46 PM", "6:32 PM", "7:41 PM"],
  ["4:19 AM", "5:46 AM", "12:12 PM", "3:46 PM", "6:33 PM", "7:42 PM"],
  ["4:17 AM", "5:45 AM", "12:11 PM", "3:47 PM", "6:34 PM", "7:43 PM"],
  ["4:15 AM", "5:43 AM", "12:11 PM", "3:47 PM", "6:35 PM", "7:44 PM"],
  ["4:13 AM", "5:42 AM", "12:11 PM", "3:47 PM", "6:36 PM", "7:45 PM"],
];

// Prayer names enum
export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTime {
  name: PrayerName;
  displayName: string;
  adhan: string;
  iqamah: string;
}

export interface TodaysPrayerTimes {
  fajr: PrayerTime;
  sunrise: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  date: Date;
}

/**
 * Check if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  if ((year & 3) !== 0) return false;
  return year % 100 !== 0 || year % 400 === 0;
}

/**
 * Convert a date to Melbourne timezone and extract date components
 */
function getMelbourneDateComponents(date: Date): { year: number; month: number; day: number } {
  const melbourneStr = date.toLocaleString("en-US", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  const parts = melbourneStr.split("/");
  return {
    month: parseInt(parts[0]) - 1, // 0-indexed
    day: parseInt(parts[1]),
    year: parseInt(parts[2])
  };
}

/**
 * Get day of year (1-366) based on Melbourne timezone
 */
function getDayOfYear(date: Date): number {
  const { year, month, day } = getMelbourneDateComponents(date);
  const dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let dayOfYear = dayCount[month] + day;
  if (month > 1 && isLeapYear(year)) {
    dayOfYear++;
  }
  return dayOfYear;
}

/**
 * Check if currently in DST (Melbourne time)
 * DST in Victoria: First Sunday of October to First Sunday of April
 * During DST, offset is UTC+11 (AEDT), otherwise UTC+10 (AEST)
 */
function isDST(date: Date): boolean {
  // Get the offset for Melbourne timezone specifically, not the local machine
  const melbourneTime = new Date(date.toLocaleString("en-US", { timeZone: "Australia/Melbourne" }));
  const utcTime = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetHours = (melbourneTime.getTime() - utcTime.getTime()) / (1000 * 60 * 60);
  // DST is active when offset is +11 hours
  return offsetHours === 11;
}

/**
 * Get the prayer times data index for a given date
 * Handles leap years and DST transitions
 */
function getPrayerTimesIndex(date: Date): number {
  let dayNum = getDayOfYear(date);
  const { year } = getMelbourneDateComponents(date);
  const leapYear = isLeapYear(year);
  const dst = isDST(date);

  // Handle Feb 29 in leap years
  if (leapYear && dayNum === 60) {
    return 365; // Special index for Feb 29
  }

  // Adjust for leap year after Feb 29
  if (leapYear && dayNum > 60) {
    dayNum -= 1;
  }

  // Handle DST transition periods
  // April 1-8 (days 91-98) when DST is still on
  if (dayNum >= 91 && dayNum <= 98 && dst) {
    return 366 + (dayNum - 91); // Indices 367-374
  }

  // October 1-8 (days 274-281) when DST is off
  if (dayNum >= 274 && dayNum <= 281 && !dst) {
    return 374 + (dayNum - 274); // Indices 375-382
  }

  // Return 0-based index
  return dayNum - 1;
}

/**
 * Iqamah time configuration
 * Now imported from prayer-config.ts for centralized management
 * When Sanity is integrated, these settings will come from CMS
 */

/**
 * Convert 12-hour time string to 24-hour format
 */
function to24Hour(timeStr: string): string {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Add minutes to a time string and return formatted result
 */
function addMinutesToTime(timeStr: string, minutes: number): string {
  const time24 = to24Hour(timeStr);
  const date = new Date(`1970-01-01T${time24}:00`);
  date.setMinutes(date.getMinutes() + minutes);

  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
}

/**
 * Calculate iqamah time based on Sanity CMS config with hardcoded fallback
 */
function calculateIqamahTime(
  prayerName: PrayerName,
  adhanTime: string,
  sanityOverride?: { mode?: "calculated" | "fixed"; fixedTime?: string; delay?: number }
): string {
  // Use Sanity values if provided
  if (sanityOverride?.mode) {
    if (sanityOverride.mode === "fixed" && sanityOverride.fixedTime) {
      return sanityOverride.fixedTime;
    }
    if (sanityOverride.mode === "calculated" && sanityOverride.delay != null) {
      return addMinutesToTime(adhanTime, sanityOverride.delay);
    }
  }
  // Fallback to hardcoded config from prayer-config.ts
  const config = getIqamahConfig(prayerName);
  if (config.mode === "fixed" && config.fixedTime) {
    return config.fixedTime;
  }
  return addMinutesToTime(adhanTime, config.delayMinutes);
}

/**
 * Get prayer times for a specific date
 */
export function getPrayerTimesForDate(
  date: Date = new Date(),
  prayerSettings?: SanityPrayerSettings | null
): TodaysPrayerTimes {
  const index = getPrayerTimesIndex(date);
  const times = PRAYER_TIMES_DATA[index];

  if (!times) {
    // Fallback to a default if something goes wrong
    console.error(`No prayer times found for index ${index}`);
    return getDefaultPrayerTimes(date);
  }

  const [fajrAdhan, sunriseAdhan, dhuhrAdhan, asrAdhan, maghribAdhan, ishaAdhan] = times;

  // Build Sanity overrides per prayer (if available)
  const sanity = prayerSettings
    ? {
        fajr: { mode: prayerSettings.fajrIqamahMode, fixedTime: prayerSettings.fajrFixedTime, delay: prayerSettings.fajrDelay },
        dhuhr: { mode: prayerSettings.dhuhrIqamahMode, fixedTime: prayerSettings.dhuhrFixedTime, delay: prayerSettings.dhuhrDelay },
        asr: { mode: prayerSettings.asrIqamahMode, fixedTime: prayerSettings.asrFixedTime, delay: prayerSettings.asrDelay },
        maghrib: { mode: prayerSettings.maghribIqamahMode, fixedTime: prayerSettings.maghribFixedTime, delay: prayerSettings.maghribDelay },
        isha: { mode: prayerSettings.ishaIqamahMode, fixedTime: prayerSettings.ishaFixedTime, delay: prayerSettings.ishaDelay },
      }
    : undefined;

  return {
    fajr: {
      name: "fajr",
      displayName: "Fajr",
      adhan: fajrAdhan,
      iqamah: calculateIqamahTime("fajr", fajrAdhan, sanity?.fajr),
    },
    sunrise: {
      name: "sunrise",
      displayName: "Sunrise",
      adhan: sunriseAdhan,
      iqamah: calculateIqamahTime("sunrise", sunriseAdhan),
    },
    dhuhr: {
      name: "dhuhr",
      displayName: "Dhuhr",
      adhan: dhuhrAdhan,
      iqamah: calculateIqamahTime("dhuhr", dhuhrAdhan, sanity?.dhuhr),
    },
    asr: {
      name: "asr",
      displayName: "Asr",
      adhan: asrAdhan,
      iqamah: calculateIqamahTime("asr", asrAdhan, sanity?.asr),
    },
    maghrib: {
      name: "maghrib",
      displayName: "Maghrib",
      adhan: maghribAdhan,
      iqamah: calculateIqamahTime("maghrib", maghribAdhan, sanity?.maghrib),
    },
    isha: {
      name: "isha",
      displayName: "Isha",
      adhan: ishaAdhan,
      iqamah: calculateIqamahTime("isha", ishaAdhan, sanity?.isha),
    },
    date,
  };
}

/**
 * Get default prayer times (fallback)
 */
function getDefaultPrayerTimes(date: Date): TodaysPrayerTimes {
  return {
    fajr: { name: "fajr", displayName: "Fajr", adhan: "5:30 AM", iqamah: "5:15 AM" },
    sunrise: { name: "sunrise", displayName: "Sunrise", adhan: "6:45 AM", iqamah: "6:55 AM" },
    dhuhr: { name: "dhuhr", displayName: "Dhuhr", adhan: "1:30 PM", iqamah: "1:40 PM" },
    asr: { name: "asr", displayName: "Asr", adhan: "5:15 PM", iqamah: "5:25 PM" },
    maghrib: { name: "maghrib", displayName: "Maghrib", adhan: "8:30 PM", iqamah: "8:35 PM" },
    isha: { name: "isha", displayName: "Isha", adhan: "9:45 PM", iqamah: "9:55 PM" },
    date,
  };
}

/**
 * Get the next prayer based on current time
 */
export function getNextPrayer(
  date: Date = new Date(),
  prayerSettings?: SanityPrayerSettings | null
): PrayerTime & { isNextDay: boolean } {
  const times = getPrayerTimesForDate(date, prayerSettings);
  const currentTime = date.getHours() * 60 + date.getMinutes();

  const prayers: PrayerTime[] = [
    times.fajr,
    times.sunrise,
    times.dhuhr,
    times.asr,
    times.maghrib,
    times.isha,
  ];

  for (const prayer of prayers) {
    if (prayer.name === "sunrise") continue; // Skip sunrise

    const time24 = to24Hour(prayer.adhan);
    const [hours, minutes] = time24.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentTime) {
      return { ...prayer, isNextDay: false };
    }
  }

  // If we're past Isha, next prayer is Fajr tomorrow
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = getPrayerTimesForDate(tomorrow, prayerSettings);

  return { ...tomorrowTimes.fajr, isNextDay: true };
}

/**
 * Get prayer times as a simple object (for backward compatibility)
 */
export function getPrayerTimesSimple(date: Date = new Date()): {
  fajr: { adhan: string; iqamah: string };
  sunrise: { adhan: string; iqamah: string };
  dhuhr: { adhan: string; iqamah: string };
  asr: { adhan: string; iqamah: string };
  maghrib: { adhan: string; iqamah: string };
  isha: { adhan: string; iqamah: string };
} {
  const times = getPrayerTimesForDate(date);
  return {
    fajr: { adhan: times.fajr.adhan, iqamah: times.fajr.iqamah },
    sunrise: { adhan: times.sunrise.adhan, iqamah: times.sunrise.iqamah },
    dhuhr: { adhan: times.dhuhr.adhan, iqamah: times.dhuhr.iqamah },
    asr: { adhan: times.asr.adhan, iqamah: times.asr.iqamah },
    maghrib: { adhan: times.maghrib.adhan, iqamah: times.maghrib.iqamah },
    isha: { adhan: times.isha.adhan, iqamah: times.isha.iqamah },
  };
}

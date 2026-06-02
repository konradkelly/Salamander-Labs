import {
  getVideos as getVideosMock,
  getThumbnail as getThumbnailMock,
  submitProcessingJob as submitProcessingJobMock,
  getJobStatus as getJobStatusMock,
} from './mockApi.js';

const isDev = import.meta.env.DEV;

function shouldFallbackFromStatus(status) {
  return isDev && status >= 500;
}

function shouldFallbackFromError(error) {
  // In dev, proxy/network failures usually show up as TypeError failures.
  return isDev && error instanceof TypeError;
}

export async function getVideos() {
  try {
    const res = await fetch('/api/videos');
    if (res.ok) {
      return res.json();
    }
    if (shouldFallbackFromStatus(res.status)) {
      return getVideosMock();
    }
    throw new Error(`Server responded ${res.status}`);
  } catch (error) {
    if (shouldFallbackFromError(error)) {
      return getVideosMock();
    }
    throw error;
  }
}

export async function getThumbnail(filename) {
  try {
    const url = `/thumbnail/${filename}`;
    const res = await fetch(url);
    if (res.ok) {
      return url;
    }
    if (shouldFallbackFromStatus(res.status)) {
      return getThumbnailMock(filename);
    }
    throw new Error(`No thumbnail for ${filename}`);
  } catch (error) {
    if (shouldFallbackFromError(error)) {
      return getThumbnailMock(filename);
    }
    throw error;
  }
}

export async function submitProcessingJob(filename, targetColor, threshold) {
  try {
    // The contract wants the hex with no leading '#'.
    const hex = targetColor.replace('#', '');
    const res = await fetch(
      `/process/${filename}?targetColor=${hex}&threshold=${threshold}`,
      { method: 'POST' }
    );
    if (res.ok) {
      return res.json();
    }
    if (shouldFallbackFromStatus(res.status)) {
      return submitProcessingJobMock(filename, targetColor, threshold);
    }
    throw new Error(`Server responded ${res.status}`);
  } catch (error) {
    if (shouldFallbackFromError(error)) {
      return submitProcessingJobMock(filename, targetColor, threshold);
    }
    throw error;
  }
}

export async function getJobStatus(jobId) {
  try {
    const res = await fetch(`/process/${jobId}/status`);
    if (res.ok) {
      return res.json();
    }
    if (shouldFallbackFromStatus(res.status)) {
      return getJobStatusMock(jobId);
    }
    throw new Error(`Server responded ${res.status}`);
  } catch (error) {
    if (shouldFallbackFromError(error)) {
      return getJobStatusMock(jobId);
    }
    throw error;
  }
}
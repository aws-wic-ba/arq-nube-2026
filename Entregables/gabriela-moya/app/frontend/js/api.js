/**
 * API abstraction layer — single boundary for backend communication.
 *
 * In AWS: POST to API Gateway → Step Functions → result.
 * Locally: POST to Flask local adapter → pipeline → result.
 * Mock: returns stored mock result for development.
 */

const API = {
  // Base URL - configurable for different environments
  baseUrl: "",

  /**
   * Submit assessment for analysis.
   * @param {Object} assessmentData - Canonical AssessmentInput
   * @returns {Promise<Object>} - { assessment_id, result: AssessmentResult }
   */
  async analyzeAssessment(assessmentData) {
    const response = await fetch(`${this.baseUrl}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment_data: assessmentData }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new ApiError(response.status, error);
    }

    return response.json();
  },
};

class ApiError extends Error {
  constructor(status, body) {
    super(body.error || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

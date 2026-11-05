# Math Lens 1.8.2 — Groq Qwen

English-language Chrome extension using **Groq only**, with model **qwen/qwen3.8-27b**. No local model installation is required.

## Install or update

Download the repository ZIP and extract it. Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`. To update, replace your installed folder contents and click **Reload**. Accept the new `api.groq.com` permission if prompted.

Enter your **Groq API key** in the popup. Old provider keys are not loaded or used. The selected model is fixed to the ID supplied by the user. Availability, account permissions, image support, and end-to-end latency have not been tested with an authenticated live request here. The example's prior assistant answer is not included in new requests: each question uses only the current exercise and tutor instructions.

## Use

Keep the question, all answer images, and their displayed letters fully visible. Zoom out if needed and close overlays covering the exercise.

**Start auto mode** begins at the current problem: capture → analyze → select → Next → repeat. Keep the popup open and the question tab active. **Stop** cancels the current AI request and prevents further steps; a Next request already sent cannot be undone. Closing the popup also stops further processing.

The loop stops on capture failure, API error, incomplete output, unclear answer, changed question, missing Next button, or navigation timeout. On the final question identified from this site's answer fields, selection is made but final submission remains manual. Other layouts may not expose a reliable final-question count. Review answers: model mistakes can be recorded by automatic Next.

For manual review, click **Capture question**, inspect the preview, then **Analyze with AI**. These separate controls do not select answers. **AI explanation and calculations** shows a concise generated worked explanation, not private internal deliberation. English is the default; Romanian and Russian explanations remain available.

## Request settings and speed

Uses `https://api.groq.com/openai/v1/chat/completions` with image data URLs, `stream: true`, `temperature: 0.6`, `top_p: 0.95`, `reasoning_effort: "default"`, and `stop: null`, matching the supplied SDK example. **Fast mode** requests an explanation under 140 words and sets `max_completion_tokens: 2048`; disabling it allows 4096. Streaming shows text as it arrives and a timer shows elapsed time. Model/server latency and rate limits still apply. No automatic selection occurs on truncated output.

## Privacy and permissions

The viewport screenshot is briefly processed in memory and cropped to the exercise region. Only the crop goes to Groq after Start or Analyze. Anything overlapping that area is captured too; check for personal information.

Your key is stored in `chrome.storage.session` and sent only to Groq in the Authorization header. It is not bundled in the files. Language and fast-mode preferences are stored locally; screenshots and responses stay in popup memory. Cookies are not read. Permissions: `activeTab`, `scripting`, `storage`, and access only to `api.groq.com`. No old provider endpoints remain in the application or host permissions.

## Compatibility and validation

Targets the top-level DOM selectors `#question-text`, `#question-answers`, `.answer-container`, and `.answer-index`. Cross-origin iframes and exercises larger than the viewport are unsupported. Uses displayed answer letters, not filenames.

JavaScript syntax and 16 unit tests cover cropping, explicit answers, Groq settings, streaming, truncation, JSON fallback, and navigation waiting/cancellation. Chrome automation and authenticated Groq calls have not been live-tested in this environment. AI can misread notation or give incorrect answers.

## Question identity fix (1.8.1)

Capture, selection, and Next now share one page reader and a stable fingerprint. It compares the question number, question image sources, and explicit displayed-letter-to-image pairs sorted by letter. Object property order and harmless DOM reordering no longer affect identity; URL query parameters are sorted without dropping any values. Image `src` is used if `currentSrc` is empty. Actual question-image or answer-mapping changes still stop selection, with a more specific message. New page-reader regression tests reproduce harmless changes and verify that real changes remain blocked. This addresses false mismatch paths found in the source; the exact trigger on the user's live page has not been confirmed.

Version 1.8.2 adds a large AI SUGGESTED ANSWER letter above the explanation. The badge is cleared for each new capture/request and set only after a completed model response; ambiguous replies show ?. Additional tests verify Next refuses changed selections and does not submit the final recognized question.

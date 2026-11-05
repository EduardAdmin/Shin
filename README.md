# Math Lens 1.7 — OrcaRouter + TokenHarbor

An English-language Chrome extension for image-based math exercises. No local model installation is required.

## Install or update

Download the repository ZIP, extract it, then open `chrome://extensions`. Enable **Developer mode**, click **Load unpacked**, and select the folder containing `manifest.json`. To update an existing installation, replace the files in its folder and click its **Reload** button.

## Configure

Select OrcaRouter and enter its API key, then choose a model:

- `z-ai/glm-5.3-flash-free`
- `deepseek/deepseek-v4.1-flash-free`

For TokenHarbor, choose **TokenHarbor** in the provider menu and enter its own API key. The default model is `deepseek-v4.1-flash:free`; the endpoint is `https://tokenharbor.ai/v1/chat/completions`. Each provider has an independent model preference and session-only credential slot. Keys are sent only to their corresponding provider. The extension cannot read a shell variable such as `$TOKENHARBOR_API_KEY`; paste the actual key in the password field.

These model IDs were supplied by the user. Availability, free access, and image support have not been independently verified. Requests use the OpenAI-compatible `image_url` format with a PNG data URL. The explanation language defaults to English after this update; you can change it to Romanian or Russian.

## Use

Open an exercise where AI assistance is allowed. Keep the entire question, choice images, and displayed letters visible; zoom out if needed. Close overlays covering the question.

Click **Start auto mode** to begin at the current question. It captures the exercise, calls the chosen AI, selects the answer, clicks Next, waits for a changed question, and repeats. Keep this popup open and the question tab active. **Stop** cancels the current AI request and prevents further steps; a Next request already sent cannot be undone. Closing the popup also stops further processing.

The loop stops on a failed capture, provider error, incomplete response, unclear answer, changed question, unavailable Next button, or navigation timeout. On the last question recognized from this site's answer fields, the choice is marked but Next/final submission is left manual. Other page layouts may not expose a reliable last-question count. AI mistakes can be recorded by the automatic Next action; review results. Provider latency and rate limits still apply, and requests run sequentially.

For a preview-first workflow, use **Capture question**, inspect the image, then **Analyze with AI**. These separate buttons do not select an answer automatically. The **AI explanation and calculations** section shows the model-generated worked explanation and final answer; it is not a record of private internal deliberation. Keep the popup open until the request finishes. Closing it discards the preview and explanation.

## Privacy

A full viewport screenshot is briefly processed in memory and cropped to the exercise area. Only that crop is sent to the selected endpoint (`https://api.orcarouter.ai/v1/chat/completions` or `https://tokenharbor.ai/v1/chat/completions`) after you click Start or Analyze. Anything overlapping that area will also be captured, so check for personal information.

The API key is stored in `chrome.storage.session`, not bundled in the extension. Model and language preferences are saved locally. Screenshots and responses remain in popup memory. Cookies are not read. Permissions are limited to `activeTab`, `scripting`, `storage`, and the two provider hosts `api.orcarouter.ai` and `tokenharbor.ai`.

## Supported pages and validation

The top-level document must use `#question-text`, `#question-answers`, `.answer-container`, and `.answer-index`. Embedded iframes and questions larger than the viewport are unsupported. The extension uses displayed answer letters, not image filenames.

JavaScript syntax checks and five unit tests pass. Live Chrome/API integration has not been tested in this environment. AI can misread notation or produce an incorrect answer; check the reasoning.

## Speed controls

Responses now stream into the explanation panel instead of waiting for the entire response. A timer shows elapsed request time. Streaming improves visibility, not necessarily total model latency.

**Fast mode**, enabled by default, asks for a worked explanation under 140 words and limits output to 2,048 tokens. Turning it off allows 4,096 tokens. Provider output limits may include hidden reasoning tokens; if the model exhausts its budget, no answer is selected. Faster settings can reduce accuracy.

**Low reasoning effort** is opt-in and sends `reasoning_effort: "low"`. TokenHarbor's public documentation consulted here did not confirm support for this setting on the selected model. It may be rejected or ignored; turn it off if requests fail. There is no automatic retry or provider switch.

Only ordinary answer text is displayed; internal reasoning fields are not shown. Automatic selection requires a completed response, never a partial streaming answer. Streaming, truncation, JSON fallback, and optional reasoning settings have unit tests. No authenticated live latency benchmark was performed.

Automation tests cover waiting through page loads without repeating the same question, cancellation, and navigation timeout. The continuous browser workflow has not been live-tested here.

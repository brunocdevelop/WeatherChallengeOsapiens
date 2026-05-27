# Notes
This is a little explanation on how I build my solution for the project

## How to run

Same as README

## Architectural decisions

- Add openMeteo and openWeatherMap folders to specify the API return type along its service
- useDebounce hook to not over-call API

## Trade-offs made due to time limit

- Couldn't check UI tests on detail
- Styles could be improved (background, animations)
- Save locations
- Proper verifications ios

## What I'd do with more time

- Check UI tests on detail
- Make cool animations
- Depending on the local time + weather make different BG
- Save locations
- Ask for current locations (or approximate from IP)

## How I used AI

Conversation explaining scopes (showing CANDIDATE_INSTRUCTIONS) between gemini and claude
Compare code answers with one another until I consider the solution to be most appropriate

Some examples of usage:
- Scaffolding
- Test generation
- UI mocks
- Generating code from instructions (e.g. creating debounce hook)

## How I didn't use AI

- To write this file 🕺

## Anything else you'd like us to know

- It was fun, thank you for the opportunity

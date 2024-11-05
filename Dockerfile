FROM nginx:1.26
# NOTE assuming `npm build` is executed, like in CI workflow.
COPY ./build /build

FROM golang:1.23-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o /bootstrap ./cmd/api

FROM public.ecr.aws/lambda/provided:al2023
COPY --from=build /bootstrap /var/runtime/bootstrap
CMD ["bootstrap"]

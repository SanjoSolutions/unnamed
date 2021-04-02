jest.mock("http")
jest.mock("https")

import { request } from "./request"
import http from "http"
import https from "https"

describe("request", () => {
  beforeEach(function () {
    const httpRequestMock = (url: any, options: any, callback: any) => {
      return {
        once: jest.fn(),
        end: jest.fn().mockImplementation(() => {
          const response = {
            headers: {
              "content-type": "application/json",
            },
            setEncoding: jest.fn(),
            on: jest.fn(),
            once: jest.fn().mockImplementation((eventName, callback) => {
              if (eventName === "end") {
                setImmediate(callback)
              }
            }),
          }
          setImmediate(() => callback(response))
        }),
      }
    }

    ;(http.request as jest.Mock).mockImplementation(httpRequestMock)
    ;(https.request as jest.Mock).mockImplementation(httpRequestMock)
  })

  it("supports HTTP", async () => {
    const url = "http://www.example.com"
    const options = {}
    await request(url)
    expect(http.request).toHaveBeenCalledWith(
      url,
      options,
      expect.any(Function)
    )
  })

  it("supports HTTPS", async () => {
    const url = "https://www.example.com"
    const options = {}
    await request(url)
    expect(https.request).toHaveBeenCalledWith(
      url,
      options,
      expect.any(Function)
    )
  })

  it("supports POST", async () => {
    const url = "http://www.example.com"
    const options = { method: "POST" }
    const data = ""
    await request(url, { ...options }, data)
    expect(http.request).toHaveBeenCalledWith(
      url,
      options,
      expect.any(Function)
    )
  })

  it("supports PUT", async () => {
    const url = "http://www.example.com"
    const options = { method: "PUT" }
    const data = ""
    await request(url, { ...options }, data)
    expect(http.request).toHaveBeenCalledWith(
      url,
      options,
      expect.any(Function)
    )
  })
})

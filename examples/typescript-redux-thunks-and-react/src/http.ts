const MOCK_HTTP_DELAY_MS = 200

export interface IResponse<T> {
  status: number
  data: T
}

function res<T>(data: T, status = 200) {
  return new Promise<IResponse<T>>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.25) {
        resolve({
          status,
          data
        })
      } else {
        reject()
      }
    }, MOCK_HTTP_DELAY_MS)
  })
}

export const http = {
  // tslint:disable-next-line no-any
  get(url: string): Promise<IResponse<any>> {
    switch (url) {
      case "/users":
        return res(
          Array(15)
            .fill(0)
            .map((_, i) => ({
              id: i,
              email: `j.doe${i}@example.com`,
              createdOn: String(new Date())
            })),
          200
        )
      case "/poll/users":
        return res({}, 200)
      default:
        return res({}, 404)
    }
  }
}

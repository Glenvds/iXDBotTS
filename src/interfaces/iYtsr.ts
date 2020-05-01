export interface iYtsr{
    "query": string,
    "items": Array<
      {
        "type": string,
        "title": string,
        "link": string,
        "thumbnail": string,
        "author": {
          "name": string,
          "ref": string,
          "verified": true
        },
        "description": string,
        "meta": {
          "Science Fiction": string,
          "2016": string,
          "FSK 16": string,
          "German": string
        },
        "actors": Array<{
          "Ryan Reynolds": string,
          "Morena Baccarin": string,
          "Ed Skrein": string
        }>,
        "director": string,
        "duration": string
      }>
      ,
    "nextpageRef": string,
    "results": string,
    "filters": Array<
      {
        "ref": null,
        "name": string,
        "active": true
      }
    >,
    "currentRef": null
  }
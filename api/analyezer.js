export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const target = req.query.url;

  if (!target) {
    return res.status(400).json({
      error: "URL is required"
    });
  }

  let url;

  try {

    url = new URL(target);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      throw new Error("Unsupported protocol");
    }

  } catch {

    return res.status(400).json({
      error: "Invalid HTTP/HTTPS URL"
    });
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      10000
    );

  try {

    const response =
      await fetch(
        url.href,
        {
          method:"GET",
          redirect:"follow",
          signal:controller.signal,
          headers:{
            "User-Agent":
              "Theme-Developer-System/2.0"
          }
        }
      );

    clearTimeout(timeout);

    const headers={};

    response.headers.forEach(
      (value,key)=>{
        headers[key]=value;
      }
    );

    let bodyPreview="";

    try {

      const text =
        await response.text();

      bodyPreview =
        text.slice(0,10000);

    } catch {

      bodyPreview="";

    }

    return res.status(200).json({

      success:true,

      status:response.status,

      statusText:response.statusText,

      method:"GET",

      finalUrl:response.url,

      headers:headers,

      bodyPreview:bodyPreview

    });

  } catch(error) {

    clearTimeout(timeout);

    if(
      error.name ===
      "AbortError"
    ){

      return res.status(504).json({
        error:"Target request timed out."
      });

    }

    return res.status(502).json({
      error:
        "Unable to reach the target server."
    });

  }

      }

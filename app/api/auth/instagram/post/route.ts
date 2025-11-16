import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { content, mediaUrls } = await req.json();

  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(/instagram_access_token=([^;]+)/);
  const accessToken = match?.[1];

  if (!accessToken)
    return NextResponse.json(
      { error: "Not authenticated with Instagram" },
      { status: 401 }
    );

  try {
    // Step 1: Get user's media object ID
    const userRes = await fetch(
      `https://graph.instagram.com/v18.0/me?fields=id&access_token=${accessToken}`
    );

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Failed to get Instagram user info" },
        { status: 401 }
      );
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // Step 2: Upload media if provided
    let mediaId: string | null = null;

    if (mediaUrls && mediaUrls.length > 0) {
      const mediaUrl = mediaUrls[0]; // Use first media

      // Fetch image from URL
      const imageRes = await fetch(mediaUrl);
      const buffer = await imageRes.arrayBuffer();

      // Create form data
      const formData = new FormData();
      formData.append("file", new Blob([buffer]), "image.jpg");
      formData.append("caption", content);
      formData.append("access_token", accessToken);

      const uploadRes = await fetch(
        `https://graph.instagram.com/v18.0/${userId}/media`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        mediaId = uploadData.id;
      }
    } else {
      // Text-only post (carousel/story)
      const uploadRes = await fetch(
        `https://graph.instagram.com/v18.0/${userId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            media_type: "CAROUSEL",
            caption: content,
            access_token: accessToken,
          }).toString(),
        }
      );

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        mediaId = uploadData.id;
      }
    }

    if (!mediaId) {
      return NextResponse.json(
        { error: "Failed to upload media to Instagram" },
        { status: 500 }
      );
    }

    // Step 3: Publish the media
    const publishRes = await fetch(
      `https://graph.instagram.com/v18.0/${userId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          creation_id: mediaId,
          access_token: accessToken,
        }).toString(),
      }
    );

    if (!publishRes.ok) {
      const errorData = await publishRes.json();
      console.error("Instagram publish error:", errorData);
      return NextResponse.json(
        { error: "Failed to publish to Instagram", details: errorData },
        { status: 500 }
      );
    }

    const publishData = await publishRes.json();
    return NextResponse.json({
      success: true,
      data: publishData,
      message: "Posted to Instagram successfully!",
    });
  } catch (err) {
    console.error("Instagram post error:", err);
    return NextResponse.json(
      { error: "Failed to post to Instagram", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

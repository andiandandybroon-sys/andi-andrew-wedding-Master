import postgres from "postgres";

const connectionString = process.env.SUPABASE_POSTGRES_URL;

const sql = connectionString
  ? postgres(connectionString, {
      max: 1,
      prepare: false
    })
  : null;

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function cleanText(value, maximumLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength);
}

function cleanStringArray(value, maximumItems = 10) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maximumItems);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse(
        {
          success: false,
          message: "Method not allowed."
        },
        405
      );
    }

    if (!sql) {
      console.error("SUPABASE_POSTGRES_URL is not available.");

      return jsonResponse(
        {
          success: false,
          message: "The RSVP service is not configured."
        },
        500
      );
    }

    try {
      const body = await request.json();

      const attendance = cleanText(body.attendance, 10);
      const leadGuestName = cleanText(body.leadGuestName, 120);
      const email = cleanText(body.email, 254).toLowerCase();
      const guestNames = cleanStringArray(body.guestNames, 10);
      const dietaryRequirements = cleanStringArray(
        body.dietaryRequirements,
        10
      );
      const dietaryDetails = cleanText(body.dietaryDetails, 1500);
      const guestMessage = cleanText(body.guestMessage, 500);

      const suppliedGuestCount = Number.parseInt(
        String(body.guestCount),
        10
      );

      const guestCount =
        attendance === "yes" ? suppliedGuestCount : 0;

      if (!["yes", "no"].includes(attendance)) {
        return jsonResponse(
          {
            success: false,
            field: "attendance",
            message: "Please select whether you are attending."
          },
          400
        );
      }

      if (!leadGuestName) {
        return jsonResponse(
          {
            success: false,
            field: "name",
            message: "Please enter your full name."
          },
          400
        );
      }

      if (!isValidEmail(email)) {
        return jsonResponse(
          {
            success: false,
            field: "email",
            message: "Please enter a valid email address."
          },
          400
        );
      }

      if (
        attendance === "yes" &&
        (!Number.isInteger(guestCount) ||
          guestCount < 1 ||
          guestCount > 10)
      ) {
        return jsonResponse(
          {
            success: false,
            field: "guest-count",
            message: "Please select the number attending."
          },
          400
        );
      }

      const requiresDietaryDetails =
        dietaryRequirements.includes("nut-allergy") ||
        dietaryRequirements.includes("other");

      if (requiresDietaryDetails && !dietaryDetails) {
        return jsonResponse(
          {
            success: false,
            field: "dietary-details",
            message:
              "Please provide details of the allergy or dietary requirement."
          },
          400
        );
      }

      const insertedRows = await sql`
        INSERT INTO public.rsvp_responses (
          attendance,
          lead_guest_name,
          email,
          guest_count,
          guest_names,
          dietary_requirements,
          dietary_details,
          accessibility_requirements,
          guest_message,
          source_page,
          submission_status
        )
        VALUES (
          ${attendance},
          ${leadGuestName},
          ${email},
          ${attendance === "yes" ? guestCount : null},
          ${sql.json(guestNames)},
          ${sql.json(
            attendance === "yes"
              ? dietaryRequirements
              : []
          )},
          ${
            attendance === "yes" && dietaryDetails
              ? dietaryDetails
              : null
          },
          ${null},
          ${guestMessage || null},
          ${"wedding-rsvp"},
          ${"submitted"}
        )
        RETURNING id, created_at
      `;

      const savedResponse = insertedRows[0];

      return jsonResponse({
        success: true,
        id: savedResponse.id,
        createdAt: savedResponse.created_at,
        message: "Thank you, your RSVP has been received."
      });
    } catch (error) {
      console.error("RSVP submission failed:", error);

      return jsonResponse(
        {
          success: false,
          message:
            "We could not save your RSVP. Please try again."
        },
        500
      );
    }
  }
};

require("dotenv/config");
import SchoologyApi from "schoology";
import { writeFile } from "fs/promises";

const client = new SchoologyApi(
  process.env.SCHOOLOGY_CLIENT_KEY!,
  process.env.SCHOOLOGY_CLIENT_SECRET!,
  `https://${process.env.DISTRICT}.schoology.com`
); // use some shitty old library (should of just used axios and created my own promises/types)

type Student = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  pictureUrl: string;
  gender: "M" | "F" | "?";
  displayName: string;
  preferredFirstName: string;
}; // how we will store our data

const toSave: any[] = [];

const createRequest = async (next = "/users/?start=0&limit=200") => {
  if (next.includes(".com/v1/")) next = next.split(".com/v1")[1]; // because we are passing in the link from the previous request it'll return the entire, so we split it and only get the part we want

  const { user, links } = await client.makeRequest("get", next);

  toSave.push(...user); // push to our array
  if (links && links.next) await createRequest(links.next);
  // if there are more students to fetch grab the next link and call the function again (recursive ftw)
};

createRequest().then(() => {
  const mapped = toSave
    .map(
      ({
        id,
        name_first,
        name_first_preferred,
        use_preferred_first_name,
        name_middle,
        name_last,
        picture_url,
        gender,
      }) => {
        // map our data how we want it in our data output
        return {
          id: id,
          firstName: name_first,
          middleName: name_middle,
          lastName: name_last,
          pictureUrl: picture_url,
          gender: gender ?? "?",
          displayName: use_preferred_first_name
            ? name_first_preferred
            : name_first,
          preferredFirstName: name_first_preferred,
        } as Student;
      }
    )
    .sort((a, b) => a.lastName.localeCompare(b.lastName)); // sort through our data by last name (alphabetically)

  writeFile("./users.json", JSON.stringify(mapped, null, 1)); // im even in this data dump!
  writeFile(
    "./user.txt",
    mapped
      .map(
        (user) =>
          `Id - ${user.id} ${user.firstName} (${user.displayName}) ${
            user.lastName
          } (Gender: ${user.gender}) - ${user.pictureUrl} (${
            user.pictureUrl.endsWith("/user-default.svg") ? "Not Set" : "Set"
          })`
      ) // map our data into strings (so the less nerdy people can read it)
      .join("\n")
  );
  console.log("We are finished! Are we done? No! We are just getting started!");
});

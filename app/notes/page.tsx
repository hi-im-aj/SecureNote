"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Box, Card, Flex, Text, TextArea, TextField } from "@radix-ui/themes";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const initialNote: { title: string; text: string } = { text: "", title: "" };

export default function page() {
  const [user, setUser] = useState<User | null>(null);
  const [privateNotes, setPrivateNotes] = useState<Note[] | null>();
  const [publicNotes, setPublicNotes] = useState<Note[] | null>(null);
  const [note, setNote] = useState<typeof initialNote>({ text: "", title: "" });
  const { text, title } = note;
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const userReq = await supabase.auth.getUser();
      if (!userReq.data.user) {
        return redirect("/sign-in");
      } else {
        setUser(userReq.data.user);
        const [privateResponse, publicResponse] = await Promise.all([
          supabase
            .from("notes")
            .select("id, title, text, created_at, is_public")
            .eq("uid", userReq.data.user.id)
            .eq("is_public", false)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("notes")
            .select("id, title, text, created_at, is_public")
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);
        const privateData: Note[] | null = privateResponse.data ?? null;
        const publicData: Note[] | null = publicResponse.data ?? null;
        setPrivateNotes(privateData);
        setPublicNotes(publicData);
      }
    };
    getData();
  }, []);

  const handleAddNote = async () => {
    if (!title || !text) {
      alert("Please fill in both title and text.");
      return;
    }

    const { data, error } = await supabase.from("notes").insert([{ title, text }]).select().single();

    if (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note.");
      return;
    }

    setPrivateNotes((prev) => (prev ? [data, ...prev] : [data]));
    setNote(initialNote);
  };

  return user ? (
    <div>
      <div className="flex-1 w-full flex flex-col gap-12 my-8">
        <Flex direction="column" gap="3">
          <Box className="my-1">
            <TextField.Root
              size="3"
              placeholder="title"
              value={note.title}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
            />
          </Box>
          <Box className="my-1">
            <TextArea
              size="3"
              placeholder="text"
              value={note.text}
              onChange={(e) => setNote({ ...note, text: e.target.value })}
            />
          </Box>
          <Box className="my-1">
            <Button onClick={handleAddNote}>Save</Button>
          </Box>
        </Flex>
      </div>
      <div className="flex-1 w-full flex gap-12">
        <Flex direction="column" gap="3">
          <Text size="4">Private Notes</Text>
          {privateNotes ? (
            privateNotes.map((e) => {
              return (
                <Box key={e.id}>
                  <Card size="2">
                    <Text as="p" size="5">
                      {e.title}
                    </Text>
                    <Text as="p" size="3">
                      {e.text}
                    </Text>
                  </Card>
                </Box>
              );
            })
          ) : (
            <Text>No private notes available</Text>
          )}
        </Flex>
        <Flex direction="column" gap="3">
          <Text size="4">Public Notes</Text>
          {publicNotes ? (
            publicNotes.map((e) => {
              return (
                <Box key={e.id}>
                  <Card size="2">
                    <Text as="p" size="5">
                      {e.title}
                    </Text>
                    <Text as="p" size="3">
                      {e.text}
                    </Text>
                  </Card>
                </Box>
              );
            })
          ) : (
            <Text>No public notes available.</Text>
          )}
        </Flex>
      </div>
    </div>
  ) : null;
}

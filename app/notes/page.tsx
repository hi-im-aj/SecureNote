"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Box, Card, Flex, Text, TextArea, TextField } from "@radix-ui/themes";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const initialNote = { title: "", text: "" };

export default function page() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [note, setNote] = useState<{ title: string; text: string }>(initialNote);
  const supabase = createClient();
  const { title, text } = note;

  useEffect(() => {
    const getData = async () => {
      const userReq = await supabase.auth.getUser();
      if (!userReq.data.user) {
        return redirect("/sign-in");
      } else {
        setUser(userReq.data.user);
        const { data } = await supabase.from("notes").select().order("created_at", { ascending: false });
        setNotes(data);
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

    setNotes((prev) => (prev ? [data, ...prev] : [data]));
    setNote(initialNote);
  };

  return user ? (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Flex direction="column" gap="3">
        <Box className="my-1">
          <TextField.Root
            size="1"
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
          <Button onClick={handleAddNote}>Share</Button>
        </Box>
      </Flex>

      {notes ? (
        notes.map((e) => {
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
        <Text>No notes available.</Text>
      )}
    </div>
  ) : null;
}

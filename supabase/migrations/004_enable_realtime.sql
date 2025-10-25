-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE features;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

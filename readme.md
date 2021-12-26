# Smash Ultimate - Fighter Sounds
I grouped 22K Smash Ultimate fighter sounds by similiarity. Don't know why I did it. Nobody asked for this. 

I just always thought the sound design for this game is kinda insane. It goes far beyond the 89 total fighters with their 15ish distinct moves. There are sounds for walking, dashing, jumping, squatting, hitting, and getting-hit that are semi-unique per character. Some characters have skins with unique sound packs (Male/Female Corrin/WiiFit/Robin, the 8 Bowser Jrs, 8-bit Little Mac). Then there are the most specific sound effects that you would never hear even after playing the game for years - like drowning, swimming, sleeping, or a dramatic slow-motion scream. Oh, let's not forget that Kirby's copy ability has custom voices for every fighter, and that every character in the game also has a crowd-chant.

## How was this data gathered and plotted?
In loose steps, I'll tell you how I pulled the files out of the switch binary. This took me days to figure out, but for some reason I was really determined to complete this questionable project.

1. Get a hold of the data.arc file. I did it the hard way, where I pulled the NSP file off of my Nintendo Switch and extracted it out get the `data.arc` file. However, I would recommend that you join [this discord server](https://discord.com/channels/394524284762193920/607064475912241152/912432463240912917), go the the `smash-ultimate` channel, and look under the pinned messages for a direct download of the latest version. It's about 16GB in size.
2. Use the [ArcExplorer Repo](https://github.com/ScanMountGoat/ArcExplorer) to extract the audio files from the giant `data.arc` file. This repo contains the files under /sound/bank/fighters and /sound/bank/fighter-voices.
3. You're going to have to extract from the `.nus3audio` file extension into multiple `.opus` and `.idsp` audio files. See [Jam1Gamer's Rust repo](https://github.com/jam1garner/nus3audio-rs/releases/). Then you're going to have to extract those `.opus` and `.idsp` files into `.wav` using [VGMStream](https://github.com/vgmstream/vgmstream/releases).
4. Extract audio features from the resulting `.wav` files. You'll probably want to use the librosa library to convert to the Mel Spectogram, and calculate the MFCC. If you're not familiar with these terms I suggest you look them up, or just find a repo and follow along. Here's [a good one by ML4A](https://github.com/ml4a/ml4a-ofx/tree/master/apps/AudioTSNEViewer). This feature vector uses MFCC, and first + second order derivatives.
5. Reduce the multi-dimensional feature-vector to 2D (or 3D) using the T-SNE's dimensionality reduction algorithm.

## How is this rendered?
Mostly D3. This is the first static website that I've built in a while with vanilla HTML + CSS + JS + D3.
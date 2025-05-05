import instagramLogo from '@/public/assets/images/social-media-icons/instagram-logo.svg'
import facebookLogo from '@/public/assets/images/social-media-icons/facebook-logo.svg'
import linkedinLogo from '@/public/assets/images/social-media-icons/linkedin-logo.svg'
import githubLogo from '@/public/assets/images/social-media-icons/github-logo.svg'
import behanceLogo from '@/public/assets/images/social-media-icons/behance-logo.svg'
import dribbbleLogo from '@/public/assets/images/social-media-icons/dribbble-logo.svg'
import deviantartLogo from '@/public/assets/images/social-media-icons/deviantart-logo.svg'
import pinterestLogo from '@/public/assets/images/social-media-icons/pinterest-logo.svg'
import mediumLogo from '@/public/assets/images/social-media-icons/medium-logo.svg'
import youtubeLogo from '@/public/assets/images/social-media-icons/youtube-logo.svg'
import tiktokLogo from '@/public/assets/images/social-media-icons/tiktok-logo.svg'
import twitchLogo from '@/public/assets/images/social-media-icons/twitch-logo.svg'
import vimeoLogo from '@/public/assets/images/social-media-icons/vimeo-logo.svg'
import soundcloudLogo from '@/public/assets/images/social-media-icons/soundcloud-logo.svg'
import bandcampLogo from '@/public/assets/images/social-media-icons/bandcamp-logo.svg'
import spotifyLogo from '@/public/assets/images/social-media-icons/spotify-logo.svg'
import redditLogo from '@/public/assets/images/social-media-icons/reddit-logo.svg'
import snapchatLogo from '@/public/assets/images/social-media-icons/snapchat-logo.svg'
import steamLogo from '@/public/assets/images/social-media-icons/steam-logo.svg'
import playstationLogo from '@/public/assets/images/social-media-icons/playstation-logo.svg'
import xboxLogo from '@/public/assets/images/social-media-icons/xbox-logo.svg'
import battlenetLogo from '@/public/assets/images/social-media-icons/battlenet-logo.svg'
import discordLogo from '@/public/assets/images/social-media-icons/discord-logo.svg'
import stackoverflowLogo from '@/public/assets/images/social-media-icons/stackoverflow-logo.svg'
import tumblrLogo from '@/public/assets/images/social-media-icons/tumblr-logo.jpeg'
import beaconsLogo from '@/public/assets/images/social-media-icons/beacons-logo.svg'
import linktreeLogo from '@/public/assets/images/social-media-icons/linktree-logo.svg'
import venmoLogo from '@/public/assets/images/social-media-icons/venmo-logo.svg'
import cashappLogo from '@/public/assets/images/social-media-icons/cashapp-logo.svg'
import patreonLogo from '@/public/assets/images/social-media-icons/patreon-logo.svg'
import paypalLogo from '@/public/assets/images/social-media-icons/paypal-logo.svg'
import cameoLogo from '@/public/assets/images/social-media-icons/cameo-logo.svg'
import buymeacoffeeLogo from '@/public/assets/images/social-media-icons/buymeacoffee-logo.png'
import shopifyLogo from '@/public/assets/images/social-media-icons/shopify-logo.svg'
import twitterLogo from '@/public/assets/images/social-media-icons/twitter-logo.svg'
export interface SocialPlatform {
    id: string
    name: string
    icon?: string
    urlPrefix: string
    placeholder?: string
}

export const socialPlatforms: SocialPlatform[] = [
    {
        id: "instagram",
        name: "Instagram",
        icon: instagramLogo,
        urlPrefix: "https://instagram.com/",
        placeholder: "username",
    },
    {
        id: "twitter",
        name: "Twitter (X)",
        icon: twitterLogo,
        urlPrefix: "https://x.com/",
        placeholder: "username",
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: facebookLogo,
        urlPrefix: "https://facebook.com/",
        placeholder: "username or page name",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: linkedinLogo,
        urlPrefix: "https://linkedin.com/in/",
        placeholder: "username",
    },
    {
        id: "github",
        name: "GitHub",
        icon: githubLogo,
        urlPrefix: "https://github.com/",
        placeholder: "username",
    },
    {
        id: "behance",
        name: "Behance",
        icon: behanceLogo,
        urlPrefix: "https://behance.net/",
        placeholder: "username",
    },
    {
        id: "dribbble",
        name: "Dribbble",
        icon: dribbbleLogo,
        urlPrefix: "https://dribbble.com/",
        placeholder: "username",
    },
    {
        id: "deviantart",
        name: "DeviantArt",
        icon: deviantartLogo,
        urlPrefix: "https://deviantart.com/",
        placeholder: "username",
    },
    {
        id: "pinterest",
        name: "Pinterest",
        icon: pinterestLogo,
        urlPrefix: "https://pinterest.com/",
        placeholder: "username",
    },
    {
        id: "medium",
        name: "Medium",
        icon: mediumLogo,
        urlPrefix: "https://medium.com/@",
        placeholder: "username or publication",
    },
    {
        id: "youtube",
        name: "YouTube",
        icon: youtubeLogo,
        urlPrefix: "https://youtube.com/",
        placeholder: "channel name or ID",
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: tiktokLogo,
        urlPrefix: "https://tiktok.com/@",
        placeholder: "username",
    },
    {
        id: "twitch",
        name: "Twitch",
        icon: twitchLogo,
        urlPrefix: "https://twitch.tv/",
        placeholder: "username",
    },
    {
        id: "vimeo",
        name: "Vimeo",
        icon: vimeoLogo,
        urlPrefix: "https://vimeo.com/",
        placeholder: "username",
    },
    {
        id: "soundcloud",
        name: "SoundCloud",
        icon: soundcloudLogo,
        urlPrefix: "https://soundcloud.com/",
        placeholder: "username",
    },
    {
        id: "bandcamp",
        name: "Bandcamp",
        icon: bandcampLogo,
        urlPrefix: "https://bandcamp.com/",
        placeholder: "username",
    },
    {
        id: "spotify",
        name: "Spotify (Artist profile)",
        icon: spotifyLogo,
        urlPrefix: "https://open.spotify.com/artist/",
        placeholder: "artist ID",
    },
    {
        id: "reddit",
        name: "Reddit",
        icon: redditLogo,
        urlPrefix: "https://reddit.com/user/",
        placeholder: "username",
    },
    {
        id: "snapchat",
        name: "Snapchat",
        icon: snapchatLogo,
        urlPrefix: "https://snapchat.com/add/",
        placeholder: "username",
    },
    {
        id: "steam",
        name: "Steam",
        icon: steamLogo,
        urlPrefix: "https://steamcommunity.com/id/",
        placeholder: "username or ID",
    },
    {
        id: "playstation",
        name: "PlayStation Network",
        icon: playstationLogo,
        urlPrefix: "https://psnprofiles.com/",
        placeholder: "username",
    },
    {
        id: "xbox",
        name: "Xbox Live",
        icon: xboxLogo,
        urlPrefix: "https://account.xbox.com/profile?gamertag=",
        placeholder: "gamertag",
    },
    {
        id: "battlenet",
        name: "Battle.net",
        icon: battlenetLogo,
        urlPrefix: "https://battle.net/",
        placeholder: "battletag",
    },
    {
        id: "discord",
        name: "Discord",
        icon: discordLogo,
        urlPrefix: "https://discord.gg/",
        placeholder: "server invite",
    },
    {
        id: "stackoverflow",
        name: "Stack Overflow",
        icon: stackoverflowLogo,
        urlPrefix: "https://stackoverflow.com/users/",
        placeholder: "user ID",
    },
    {
        id: "tumblr",
        name: "Tumblr",
        icon: tumblrLogo,
        urlPrefix: "https://tumblr.com/blog/",
        placeholder: "blog name",
    },
    {
        id: "beacons",
        name: "Beacons",
        icon: beaconsLogo,
        urlPrefix: "https://beacons.ai/",
        placeholder: "username",
    },
    {
        id: "linktree",
        name: "Linktree",
        icon: linktreeLogo,
        urlPrefix: "https://linktr.ee/",
        placeholder: "username",
    },
    {
        id: "venmo",
        name: "Venmo",
        icon: venmoLogo,
        urlPrefix: "https://venmo.com/",
        placeholder: "username",
    },
    {
        id: "cashapp",
        name: "Cash App",
        icon: cashappLogo,
        urlPrefix: "https://cash.app/$",
        placeholder: "username",
    },
    {
        id: "patreon",
        name: "Patreon",
        icon: patreonLogo,
        urlPrefix: "https://patreon.com/",
        placeholder: "username",
    },
    {
        id: "paypal",
        name: "PayPal",
        icon: paypalLogo,
        urlPrefix: "https://paypal.me/",
        placeholder: "username",
    },
    {
        id: "cameo",
        name: "Cameo",
        icon: cameoLogo,
        urlPrefix: "https://cameo.com/",
        placeholder: "username",
    },
    {
        id: "buymeacoffee",
        name: "Buy Me a Coffee",
        icon: buymeacoffeeLogo,
        urlPrefix: "https://buymeacoffee.com/",
        placeholder: "username",
    },
    {
        id: "shopify",
        name: "Shopify",
        icon: shopifyLogo,
        urlPrefix: "https://",
        placeholder: "your-store.myshopify.com",
    },
    {
        id: "custom",
        name: "Custom",
        urlPrefix: "",
        placeholder: "https://",
    },
]




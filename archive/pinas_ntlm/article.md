# My NAS Woes

I've spent 3 hours to 1:30AM tearing my hair out trying to debug why my dad's work laptop can't connect to this NAS I'm setting up for them despite every other computer being able to and it was the most stupid, obscure issue ever. I NEED to tell someone about it, and I think you might be the only person I know who *MIGHT* be able to sympathize with my pain.

The NAS is running off of my Raspberry Pi, running OpenMediaVault. My family uses Windows across the board, and Windows PCs use Microsoft's SMB communication protocol to share access to files. No problem, OMV supports broadcasting over SMB via a linux-specific reimplementation of SMB known as SAMBA. For every other computer on the network, that was the end of the story: toggle on SMB and every computer could easily connect... except my dad's work laptop. Same username/password combo kept returning with a "username/password incorrect" error, which I KNEW wasn't true.

## Hour 1: Trying to get to the SAMBA logs
After digging in my OMV SMB settings, I found a logging option. I promptly switched it to "DEBUG", and went to the SMB auditing diagnostic log in the web interface. No matter what i could do, I couldn't get it to show anything. After some research, I found that this switch enables the logger under the hood; this logger doesn't connect to the front end UI 🙄. After wasting my time with that, I spend more time trying to figure out where it's being logged to, which is /var/log/samba. My saving grace is that the logs are split by IP address of each device connecting, so it's easy to find the right logs.

## Hour 2: Combing through DEBUG vomit
Naturally, DEBUG vomits A LOT of text back, so just trying to scan this ridiculously long text file consumes another hour of my time. I FINALLY find the log entry that prints the authentication request. NICE!! Now, I can compare the auth request from a computer that works and compare that to the auth request of my dad's laptop

Not that easy. I've already connected to the NAS. On Windows, it's STUPIDLY difficult to disconnect from a file share: https://superuser.com/questions/883604. The password is cached SOMEWHERE and just randomly times out every once in a while. Great. Gotta twiddle my thumbs until Windows decides to kick me out. Eventually, I get kicked out and I run two identical (to me) auth requests. (1) from my desktop that works, and (2) from the laptop that doesn't.

## Hour 3: A single character
After digging through the logs YET AGAIN, I find the two auth requests and do a text compare on the dictionary. I notice the user/passw combo didn't resolve properly to a user security ID, which didn't make sense. If I'm providing the same values for user/passw, why wouldn't it resolve to the same value?

Some background: Most routers have a built-in NAS that allows you to share a drive connected to its USB port. I tried this before the Pi NAS, but the router was just too weak/old. But in that experiment, I ran into an issue where the router only supported SMB1.0, which was deprecated by Microsoft in favor of SMB2.0 due to security concerns. Computers couldn't connect because they dropped support for SMB1.0. That experiment taught me that protocol versions were VERY important here, and a deprecated protocol version could be blocked, preventing devices from connecting.

I look back CLOSELY at the logs and I notice one tiny difference:
`Auth: user [Computer 1]\[User] with [NTLMv2] status [NT_STATUS_OK]...`
`Auth: user [Computer 2]\[User] with [NTLMv1] status [NT_STATUS_WRONG_PASSWORD]...`

## NTLMv2 vs NTLMv1
I've never heard of NTLM before, but I'm immediately suspicious of that difference because of how I got burned by the SMB1.0 issue earlier. A quick google search immediately returns this thread of a user describing my exact problem: https://forum.openmediavault.org/index.php?thread/38336-smb-shares-inaccessible-on-windows-7-and-10/

Turns out NTLM (NT Lan Manager) is a security protocol that manages auth requests. And similar to SMB1.0, v1 was deprecated due to security concerns. OMV only supports, by default, NTLMv2 for auth. All the other computers at home are new enough that they default to NTLMv2. For WHATEVER REASON, my dad's corporate laptop is using NTLMv1. Luckily the thread has a flag to enable NTLMv1 auth, which *SUCCESS* fixes the issue!

It's not that I wasn't providing the right values for user/passw. It's that the protocol delivering the credential payload wasn't being accepted.

(╯°□°)╯︵ ┻━┻
I'm going to bed.
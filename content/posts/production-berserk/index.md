---
title: "How Everything Suddenly Goes Berserk in Production"
date: 2024-06-20T18:00:02+05:30
description: This article talks about how shit unexpectedly blows up in the production environment, and a case study of how I brought back animeviz online.
menu:
  sidebar:
    name: Production Blunder
    identifier: production-blunder
    weight: 30
author:
  name: Shravan Asati
  image: /images/author/shravan.png
math: false
hero: hero.jpg
---

I often tend to take a look at the websites I've deployed - to check whether they are still online or not (I should use monitoring services). It also helps with the gloom that appears on my face when I view the website analytics.

One such time was the fine summer morning of 13th June 2024. I woke up late and checked my mobile for notifications (there weren't any). I decided to perform the health check of my websites. All of them were working fine, except [animeviz](https://animeviz.ninja). When I opened it, it showed the default 502 Bad Gateway error page of nginx - which meant the python server was down. I was flabbergasted really - there weren't any recent code changes (last commit on the repository was almost 20 days ago). I kind of saw what was coming for me - a long debugging session. I slept back again and didn't start solving the problem until 11:30 AM.


{{<vs 2>}}


## Background

For those who don't know, [animeviz](https://animeviz.ninja) is a website that draws visualizations on your anime lists. It uses the [MyAnimeList](https://myanimelist.net) API to fetch user animelist, and then processes the data and draws some visualizations on it. The backend server is written in Python using the Flask library. It is deployed on a small DigitalOcean Droplet (1GB RAM, 25GB disk).

{{<vs 2>}}

## Investigation

I refreshed the page a couple more times and the result was *unexpectedly* the same 😔. This meant the problem was something huge. I'd rather not admit this, but animeviz has issues with memory leaks. Overtime, its memory usage just keeps increasing, reaching 100% when the Linux OOM (out of memory) killer kills the gunicorn process which is serving the site. This used to be a weekly occurence previously, and I had to manually SSH into the VPS and restart the server. Of course this wasn't ideal, I tried minimizing the memory leaks and modified the systemd service to restart the gunicorn process everytime it is shut down. This solved the downtime problem to a large extent and animeviz didn't go down in the last two months (until 13th June) since I made those changes.

The fact that animeviz was still down meant that the issue wasn't with memory leaks, since systemd would have already restarted it in that case. I quickly went over to the DigitalOcean dashboard and looked at the resource insights. The CPU has been maxing out since the last **5 hours** (from about 6:15am) and the memory graph was a zig zag curve wobbling between 50% and 70%. Yikes!

I quickly SSH'd into the droplet and looked at the animeviz service logs using journalctl.

```
sudo journalctl -u animeviz
```

This opened the service logs from the first line and I pressed `G` to navigate to the last line (vim keybindings work on the less pager). This operation took about 30s, and when I reached the end of the file, the line count showed a number around 9lakhs! The navigation in the file itself was proving very difficult and slow. I googled how to remove old logs in journalctl and found a command.

```
sudo journalctl -u animeviz --vacuum-time 1d
```

This command removed all logs older than a day. Navigation was still slow (around 4 lakh lines remained). I still looked through the logs, the systemd restart counter was at **200** (😧). The same error was popping thorughout the logs, something related to mysql database connection. I was kind of relieved, since it was safe to assume that there wasn't anything wrong with *my* code. This was part of the traceback:

```
Jun 13 10:50:30 animeviz gunicorn[879657]: sqlalchemy.exc.DatabaseError: (mysql.connector.errors.DatabaseError) 2003 (HY000): Can't connect to MySQL server on 'localhost:3306' (111)
```

I checked the status of the mysql service.

```
sudo systemctl status mysql
```

The status part showed "Server upgrade in process...". Huh, that was confusing. I restarted both mysql and animeviz services. The situation didn't change. I powered off the droplet and powered it on again, to no avail. One of the most powerful tools under my belt had just failed, and about 20 mins have been lost.

I tried connecting with the database using the mysql client, as root.

```
sudo mysql -u root
```

```
> Can't connect to MySQL server on 'localhost:3306' (111)
```

So, I cannot connect with the official client either. That means the issue is definitely with the mysql server/daemon.

{{<vs 2>}}

## The Culprit


I checked the mysql logs using journalctl.

```
sudo journalctl -u mysql
```

This is what those logs looked like:
```
mysql.service: Scheduled restart job, restart counter is at 180.
Jun 13 11:26:36 animeviz systemd[1]: Stopped MySQL Community Server.
Jun 13 11:26:36 animeviz systemd[1]: mysql.service: Consumed 39.062s CPU time.
Jun 13 11:26:36 animeviz systemd[1]: Starting MySQL Community Server...
Jun 13 11:28:38 animeviz systemd[1]: mysql.service: Main process exited, code=exited, status=1/FAILURE
Jun 13 11:28:38 animeviz systemd[1]: mysql.service: Failed with result 'exit-code'.
Jun 13 11:28:38 animeviz systemd[1]: Failed to start MySQL Community Server.
Jun 13 11:28:38 animeviz systemd[1]: mysql.service: Consumed 39.131s CPU time.
```

Notice the restart counter. I was quite annoyed to see that the *actual* error wasn't reported in these logs. I checked the service status again, and this time it had a different message similar to: "Server upgrade failed, timeout due to lock".

I stopped the animeviz service since restarting them was just consuming more resources, and I had a hunch that the animeviz server, repeatedly trying to establish a connection with mysql might be interfering iwth the server upgrade.


I googled "server upgrade in progress mysql" and the first two links were forums titled **"MySQL stuck in an upgrade loop with high CPU usage"**. Jackpot 😎.

> For the reader's reference: this is the [first](https://forum.virtualmin.com/t/mysql-stuck-in-an-upgrade-loop-with-high-cpu-usage/112767) and [second](https://serverfault.com/questions/1130794/mysql-stopped-working-on-ubuntu-22-04-failed-to-upgrade-server-error) forum I found.

In that first forum, I found out that mysql logs the *actual* errors in this file: `/var/log/mysql/error.log`.
I used the tail command given in the forum.

```
tail /var/log/mysql/error.log
```

Since those logs were in the `/var` directory, I can't read them as of the writing date, but I vaguely remember it was along the lines of "timeout due to locking". The error was not similar to the two forum posts. 


Regardless, I thought I should pursue the steps given in the second forum (stack exchange always works 🙇). I followed these steps in order:

1. Stopped the mysql service.

```
sudo systemctl stop mysql
```

2. Ran the server with minimal upgrade flag.

```
/usr/sbin/mysqld --upgrade minimal
```

As pointed out in the answer by [KK Chauhan](https://serverfault.com/users/1020898/k-k-chauhan), the command failed, giving an error like unable to create sock file. They also answered that this could be solved by creating the following directory.

```
sudo mkdir /var/run/mysqld
```

This wasn't enough (the server had the same error as above), I also had to change the ownership of this folder.

```
sudo chown mysql:mysql /var/run/mysqld
```

I ran the mysql server again with the minimal upgrade flag. The server started this time! WOOHOO!
I tried connecting with the mysql client. That worked too. Now I felt like I was getting somewhere.
I stopped the server since this wasn't going to cut it: it was a hacky solution and in no time it would come to bite me again.

3. I created database backup.

```bash
for DB in $(mysql -u root -pPassword -e 'show databases' -s --skip-column-names); do
mysqldump -u root -pPassword $DB > "$DB.sql";
done
```

Backing up the database was necessary, since a couple of tables had rows in 4-5 digits.

4. I started the mysql service in hopes it would be back running.

```
sudo systemctl start mysql
```

My hopes were shattered. JournalCTL had superficial error logs. Again, as pointed in the stack exchange answer, I checked out the mysql error log file. And it showed the error same as that in the first forum! Talk about non-linear storytelling.

I went back to the first forum and read the solution (the OP answered it themselves). Basically, the error was about mysql failing to upgrade due to limited `thread_stack` size. I have no idea what that parameter is about. Regardless, I navigated to `/etc/mysql` directory to double the `thread_stack`. On `ls -R`, I noticed there were a lot of configuration files. I opened the `./mysql.conf.d/mysqld.cnf` file in vim and changed the `thread_stack` parameter from `128K`to `256K`.

As quickly as my hopes went up, they came crashing down as the mysql server didn't start and threw the same error at my face, again. I had a hunch that I'd have to edit all the files with the `thread_stack` parameter.

So that's what I did. I searched all the files with the text `thread_stack` in the `/etc/mysql` directory.

```
sudo grep thread_stack -R .
```

It showed three files - one of which I had already edited. I did the same change for the other two files. It had to work this time. If it didn't, I'd have to purge mysql and reinstall (and re-setup), which is quite a lengthy process.

**The moment of truth**: IT FINALLY WORKED!
<br>
And this time, fr, the server started. 

I started the animeviz service too. Visited animeviz.ninja. It was live. After an hour.

One thing, which still remains a mystery is what caused the mysql server upgrade. Was it scheduled, or triggered by someone (😨), or mysql suddenly decided it wants to upgrade? I'd appreciate if some subject expert helped me resolve this question.


## Bye

That's all folks. I hope you guys enjoyed and learnt something from this blog. I think this would come in handy next time something like this happens, to me, or to anyone else.


(here's my [referral link](https://m.do.co/c/54305c9231e8) for digitalocean, sign up using it, you get free credits, I get free credits)
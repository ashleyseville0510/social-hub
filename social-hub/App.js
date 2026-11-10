import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const COLORS = {
  background: '#F7F6F2',
  surface: '#FFFFFF',
  ink: '#20211F',
  muted: '#858782',
  line: '#ECECE7',
  accent: '#F16A4F',
  accentSoft: '#FFF0EB',
  green: '#477B65',
  greenSoft: '#E8F1EB',
  lavender: '#F0EDFA',
};

const PROFILE = {
  name: 'Maya Chen',
  handle: '@mayamakes',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces',
  bio: 'Collecting little moments, good coffee, and people who make the ordinary feel special.',
};

const PEOPLE = [
  { id: 'ava', name: 'Ava Williams', handle: '@avainbloom', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces', note: 'Ceramic artist' },
  { id: 'leo', name: 'Leo Martin', handle: '@leomakes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces', note: 'Photographer' },
  { id: 'nina', name: 'Nina Park', handle: '@ninapark', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=faces', note: 'Slow living enthusiast' },
];

const INITIAL_POSTS = [
  {
    id: 'post-1',
    author: 'Ava Williams',
    handle: '@avainbloom',
    avatar: PEOPLE[0].avatar,
    time: '18 min ago',
    category: 'Creative life',
    text: 'A slow morning in the studio, a fresh pot of coffee, and a kiln full of things I can’t wait to share. I hope you found a little moment for yourself today, too. ☕',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&h=900&fit=crop',
    likes: 128,
    comments: 18,
  },
  {
    id: 'post-2',
    author: 'Leo Martin',
    handle: '@leomakes',
    avatar: PEOPLE[1].avatar,
    time: '1 hr ago',
    category: 'Photography',
    text: 'Golden hour did its thing again. Took the long way home and I’m so glad I did.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&h=900&fit=crop',
    likes: 86,
    comments: 9,
  },
  {
    id: 'post-3',
    author: 'Nina Park',
    handle: '@ninapark',
    avatar: PEOPLE[2].avatar,
    time: '3 hrs ago',
    category: 'Everyday joy',
    text: 'Tiny reminder: you don’t have to make every day extraordinary for it to be a good one. 🌿',
    likes: 204,
    comments: 32,
  },
];

const STORIES = [
  { id: 'ava', name: 'Ava', avatar: PEOPLE[0].avatar, color: '#E6C7A9', caption: 'Making something with my hands today.' },
  { id: 'leo', name: 'Leo', avatar: PEOPLE[1].avatar, color: '#D5D9C7', caption: 'A little detour. A lot of fresh air.' },
  { id: 'nina', name: 'Nina', avatar: PEOPLE[2].avatar, color: '#E5C5C0', caption: 'Found my new favorite corner.' },
  { id: 'maya', name: 'Your story', avatar: PROFILE.avatar, color: '#E8DFF5', caption: 'Every good story starts with a little hello.' },
];

const CONVERSATIONS = [
  { id: 'ava', name: 'Ava Williams', handle: '@avainbloom', avatar: PEOPLE[0].avatar, preview: 'You have to come by the studio sometime!', time: '2m', unread: true, messages: [{ id: 'a1', from: 'them', text: 'Hey Maya! How have you been?' }, { id: 'a2', from: 'me', text: 'So good! I’ve been meaning to visit your studio.' }, { id: 'a3', from: 'them', text: 'You have to come by the studio sometime!' }] },
  { id: 'leo', name: 'Leo Martin', handle: '@leomakes', avatar: PEOPLE[1].avatar, preview: 'That photo is from the coast last weekend.', time: '1h', unread: false, messages: [{ id: 'l1', from: 'them', text: 'Thanks for the kind words on my photo!' }, { id: 'l2', from: 'me', text: 'That light was unreal.' }, { id: 'l3', from: 'them', text: 'That photo is from the coast last weekend.' }] },
  { id: 'nina', name: 'Nina Park', handle: '@ninapark', avatar: PEOPLE[2].avatar, preview: 'Coffee next week? My treat ☕', time: '3h', unread: false, messages: [{ id: 'n1', from: 'them', text: 'I found a new little cafe you would love.' }, { id: 'n2', from: 'them', text: 'Coffee next week? My treat ☕' }] },
];

const NOTIFICATIONS = [
  { id: 'n1', name: 'Ava Williams', avatar: PEOPLE[0].avatar, text: 'liked your recent post.', time: '12 min ago', icon: '♡' },
  { id: 'n2', name: 'Leo Martin', avatar: PEOPLE[1].avatar, text: 'started following you.', time: '1 hr ago', icon: '＋' },
  { id: 'n3', name: 'Nina Park', avatar: PEOPLE[2].avatar, text: 'mentioned you in a comment.', time: 'Yesterday', icon: '↗' },
];

function readStorage(key, fallback) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function useLocalValue(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not save ${key} to local storage.`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

function Avatar({ uri, size = 44, style }) {
  return (
    <Image
      source={{ uri }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}
      accessibilityIgnoresInvertColors
    />
  );
}

function IconButton({ label, onPress, children, badge }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Text style={styles.iconButtonText}>{children}</Text>
      {badge ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}

function AppButton({ label, onPress, secondary = false, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.appButton,
        secondary && styles.appButtonSecondary,
        style,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.appButtonText, secondary && styles.appButtonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

function PostCard({ post, liked, saved, onLike, onSave, onComment, onShare, onProfile }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel={`View ${post.author}'s profile`} style={styles.postAuthor}>
          <Avatar uri={post.avatar} size={44} />
          <View style={styles.postAuthorText}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorMeta}>{post.handle} · {post.time}</Text>
          </View>
        </Pressable>
        <View>
          <IconButton label="More post options" onPress={() => setMoreOpen(!moreOpen)}>···</IconButton>
          {moreOpen ? (
            <View style={styles.moreMenu}>
              <Pressable onPress={() => { onSave(); setMoreOpen(false); }} style={styles.moreMenuItem}>
                <Text style={styles.moreMenuText}>{saved ? 'Remove from saved' : 'Save post'}</Text>
              </Pressable>
              <Pressable onPress={() => setMoreOpen(false)} style={styles.moreMenuItem}>
                <Text style={styles.moreMenuText}>Close menu</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.postCategory}>{post.category}</Text>
      <Text style={styles.postCopy}>{post.text}</Text>
      {post.image ? <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" /> : null}
      <View style={styles.postStats}>
        <Text style={styles.postStatsText}>{post.likes + (liked ? 1 : 0)} appreciations</Text>
        <Pressable onPress={onComment} accessibilityRole="button">
          <Text style={styles.postStatsText}>{post.comments} comments</Text>
        </Pressable>
      </View>
      <View style={styles.postActions}>
        <Pressable onPress={onLike} accessibilityRole="button" accessibilityLabel={liked ? 'Unlike post' : 'Like post'} style={styles.postAction}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, liked && styles.likedLabel]}>{liked ? 'Appreciated' : 'Appreciate'}</Text>
        </Pressable>
        <Pressable onPress={onComment} accessibilityRole="button" style={styles.postAction}>
          <Text style={styles.actionIcon}>◯</Text>
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable onPress={onShare} accessibilityRole="button" style={styles.postAction}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
        <Pressable onPress={onSave} accessibilityRole="button" accessibilityLabel={saved ? 'Unsave post' : 'Save post'} style={styles.saveAction}>
          <Text style={[styles.actionIcon, saved && styles.savedIcon]}>{saved ? '▣' : '▢'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width > 980;
  const todayLabel = useMemo(() => new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase(), []);
  const [activeTab, setActiveTab] = useState('Home');
  const [posts, setPosts] = useLocalValue('social-hub-posts', INITIAL_POSTS);
  const [likedIds, setLikedIds] = useLocalValue('social-hub-likes', []);
  const [savedIds, setSavedIds] = useLocalValue('social-hub-saves', []);
  const [comments, setComments] = useLocalValue('social-hub-comments', {});
  const [following, setFollowing] = useLocalValue('social-hub-following', ['ava', 'leo']);
  const [profile, setProfile] = useLocalValue('social-hub-profile', PROFILE);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('For you');
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [commentPost, setCommentPost] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const [messageDraft, setMessageDraft] = useState('');

  const selectedPost = posts.find((post) => post.id === commentPost);
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTab === 'Profile') result = result.filter((post) => post.author === profile.name);
    if (activeTab === 'Saved') result = result.filter((post) => savedIds.includes(post.id));
    if (activeTab === 'Discover' && search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((post) => `${post.author} ${post.handle} ${post.text} ${post.category}`.toLowerCase().includes(term));
    }
    if (activeTab === 'Discover' && selectedCategory !== 'For you') {
      result = result.filter((post) => post.category === selectedCategory);
    }
    if (activeTab === 'Home' && selectedCategory === 'Following') {
      result = result.filter((post) => following.some((id) => post.handle === PEOPLE.find((person) => person.id === id)?.handle));
    }
    return result;
  }, [activeTab, posts, profile.name, savedIds, search, selectedCategory, following]);

  function showFeed(tab) {
    setActiveTab(tab);
    setSelectedConversation(null);
    if (tab === 'Home') setSelectedCategory('For you');
    if (tab === 'Discover') setSelectedCategory('For you');
  }

  function toggleId(list, setList, id) {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function publishPost() {
    const text = draft.trim();
    if (!text) return;
    const post = {
      id: `post-${Date.now()}`,
      author: profile.name,
      handle: profile.handle,
      avatar: profile.avatar,
      time: 'Just now',
      category: 'Everyday joy',
      text,
      likes: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setDraft('');
    setComposerOpen(false);
    setActiveTab('Home');
    setSelectedCategory('For you');
  }

  function addComment() {
    const text = commentDraft.trim();
    if (!text || !commentPost) return;
    const entry = { id: `comment-${Date.now()}`, author: profile.name, avatar: profile.avatar, text };
    setComments({ ...comments, [commentPost]: [...(comments[commentPost] || []), entry] });
    setPosts(posts.map((post) => post.id === commentPost ? { ...post, comments: post.comments + 1 } : post));
    setCommentDraft('');
  }

  async function sharePost(post) {
    try {
      await Share.share({ message: `${post.author} on Social Hub: ${post.text}` });
    } catch (error) {
      console.warn('Could not share this post.', error);
    }
  }

  function sendMessage() {
    const text = messageDraft.trim();
    if (!text || !selectedConversation) return;
    setConversations(conversations.map((conversation) => conversation.id === selectedConversation
      ? {
        ...conversation,
        preview: text,
        time: 'now',
        messages: [...conversation.messages, { id: `message-${Date.now()}`, from: 'me', text }],
      }
      : conversation));
    setMessageDraft('');
  }

  function renderPosts() {
    if (!filteredPosts.length) {
      const isProfile = activeTab === 'Profile';
      const isSaved = activeTab === 'Saved';
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>{isProfile ? '✳' : isSaved ? '▢' : '⌕'}</Text>
          <Text style={styles.emptyTitle}>{isProfile ? 'Your story starts here' : isSaved ? 'Nothing saved yet' : 'No posts found'}</Text>
          <Text style={styles.emptyCopy}>{isProfile ? 'Share a thought or a little moment with your community.' : isSaved ? 'Save a post you love and it’ll be waiting here.' : 'Try another search or explore a different topic.'}</Text>
          {isProfile ? <AppButton label="Write your first post" onPress={() => setComposerOpen(true)} /> : null}
        </View>
      );
    }
    return filteredPosts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        liked={likedIds.includes(post.id)}
        saved={savedIds.includes(post.id)}
        onLike={() => toggleId(likedIds, setLikedIds, post.id)}
        onSave={() => toggleId(savedIds, setSavedIds, post.id)}
        onComment={() => setCommentPost(post.id)}
        onShare={() => sharePost(post)}
        onProfile={() => showFeed('Discover')}
      />
    ));
  }

  function renderStories() {
    return (
      <View style={styles.storiesCard}>
        <View style={styles.storiesHeader}>
          <Text style={styles.sectionTitle}>Little moments</Text>
          <Text style={styles.subtleText}>Stories from your circle</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyList}>
          {STORIES.map((story) => (
            <Pressable key={story.id} onPress={() => setActiveStory(story)} accessibilityRole="button" accessibilityLabel={`View ${story.name}'s story`} style={styles.storyItem}>
              <View style={[styles.storyRing, { backgroundColor: story.color }]}>
                <Avatar uri={story.avatar} size={58} style={styles.storyAvatar} />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  function renderHome() {
    return (
      <>
        <View style={styles.greeting}>
          <View>
            <Text style={styles.eyebrow}>{todayLabel}</Text>
            <Text style={styles.pageTitle}>A little more connected.</Text>
            <Text style={styles.pageSubtitle}>Good to see you, {profile.name.split(' ')[0]}.</Text>
          </View>
          <Pressable onPress={() => setComposerOpen(true)} accessibilityRole="button" style={styles.writeButton}>
            <Text style={styles.writeButtonPlus}>＋</Text>
            <Text style={styles.writeButtonText}>Share a moment</Text>
          </Pressable>
        </View>
        {renderStories()}
        <View style={styles.feedHeading}>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <View style={styles.feedFilters}>
            {['For you', 'Following'].map((filter) => (
              <Pressable key={filter} onPress={() => setSelectedCategory(filter)} accessibilityRole="button" style={[styles.filterChip, selectedCategory === filter && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, selectedCategory === filter && styles.filterChipTextActive]}>{filter}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {renderPosts()}
      </>
    );
  }

  function renderDiscover() {
    const categories = ['For you', 'Creative life', 'Photography', 'Everyday joy'];
    return (
      <>
        <View style={styles.pageIntro}>
          <Text style={styles.eyebrow}>A WORLD OF GOOD THINGS</Text>
          <Text style={styles.pageTitle}>Find your people.</Text>
          <Text style={styles.pageSubtitle}>Fresh ideas, kind people, and things worth sharing.</Text>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search people, moments, or topics" placeholderTextColor={COLORS.muted} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Search people, moments, or topics" />
          {search ? <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search"><Text style={styles.clearSearch}>×</Text></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((category) => (
            <Pressable key={category} onPress={() => setSelectedCategory(category)} accessibilityRole="button" style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}>
              <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>People you might love</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleList}>
          {PEOPLE.map((person) => {
            const isFollowing = following.includes(person.id);
            return (
              <View key={person.id} style={styles.personCard}>
                <Avatar uri={person.avatar} size={52} />
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personNote}>{person.note}</Text>
                <AppButton label={isFollowing ? 'Following' : 'Follow'} secondary={isFollowing} onPress={() => toggleId(following, setFollowing, person.id)} style={styles.personFollowButton} />
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.feedHeading}>
          <Text style={styles.sectionTitle}>{search ? 'Search results' : 'A little inspiration'}</Text>
        </View>
        {renderPosts()}
      </>
    );
  }

  function renderInbox() {
    const conversation = conversations.find((item) => item.id === selectedConversation);
    if (conversation) {
      return (
        <View style={styles.thread}>
          <View style={styles.threadHeader}>
            <Pressable onPress={() => setSelectedConversation(null)} accessibilityRole="button" style={styles.backButton}><Text style={styles.backButtonText}>‹</Text></Pressable>
            <Avatar uri={conversation.avatar} size={40} />
            <View style={styles.threadHeaderText}>
              <Text style={styles.authorName}>{conversation.name}</Text>
              <Text style={styles.authorMeta}>{conversation.handle}</Text>
            </View>
            <IconButton label="View profile" onPress={() => showFeed('Discover')}>···</IconButton>
          </View>
          <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
            <Text style={styles.conversationNote}>You and {conversation.name.split(' ')[0]} are part of the same circle.</Text>
            {conversation.messages.map((message) => (
              <View key={message.id} style={[styles.messageBubble, message.from === 'me' ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, message.from === 'me' && styles.myMessageText]}>{message.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.messageComposer}>
            <TextInput value={messageDraft} onChangeText={setMessageDraft} placeholder="Write a message..." placeholderTextColor={COLORS.muted} style={styles.messageInput} onSubmitEditing={sendMessage} returnKeyType="send" accessibilityLabel="Write a message" />
            <Pressable onPress={sendMessage} accessibilityRole="button" accessibilityLabel="Send message" style={[styles.sendButton, !messageDraft.trim() && styles.sendButtonDisabled]}>
              <Text style={styles.sendButtonText}>↑</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return (
      <>
        <View style={styles.pageIntro}>
          <Text style={styles.eyebrow}>YOUR PEOPLE, ONE HELLO AWAY</Text>
          <Text style={styles.pageTitle}>Inbox.</Text>
          <Text style={styles.pageSubtitle}>Good conversations make the day.</Text>
        </View>
        <View style={styles.inboxCard}>
          {conversations.map((item, index) => (
            <Pressable key={item.id} onPress={() => {
              setSelectedConversation(item.id);
              setConversations(conversations.map((conversationItem) => conversationItem.id === item.id ? { ...conversationItem, unread: false } : conversationItem));
            }} accessibilityRole="button" style={[styles.conversationRow, index < conversations.length - 1 && styles.conversationDivider]}>
              <Avatar uri={item.avatar} size={52} />
              <View style={styles.conversationText}>
                <View style={styles.conversationNameRow}>
                  <Text style={styles.authorName}>{item.name}</Text>
                  <Text style={styles.conversationTime}>{item.time}</Text>
                </View>
                <Text style={[styles.conversationPreview, item.unread && styles.conversationUnread]} numberOfLines={1}>{item.preview}</Text>
              </View>
              {item.unread ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          ))}
        </View>
        <Text style={styles.inboxFootnote}>A little kindness travels a long way. ✨</Text>
      </>
    );
  }

  function renderProfile() {
    const ownPosts = posts.filter((post) => post.author === profile.name);
    return (
      <>
        <View style={styles.profileHero}>
          <View style={styles.profileCover}>
            <View style={styles.coverDecorOne} />
            <View style={styles.coverDecorTwo} />
          </View>
          <View style={styles.profileIdentity}>
            <Avatar uri={profile.avatar} size={82} style={styles.profileAvatar} />
            <AppButton label="Edit profile" secondary onPress={() => { setNameDraft(profile.name); setBioDraft(profile.bio); setEditingProfile(true); }} />
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileHandle}>{profile.handle}</Text>
          <Text style={styles.profileBio}>{profile.bio}</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}><Text style={styles.profileStatNumber}>{ownPosts.length}</Text><Text style={styles.profileStatLabel}>posts</Text></View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}><Text style={styles.profileStatNumber}>{following.length}</Text><Text style={styles.profileStatLabel}>following</Text></View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}><Text style={styles.profileStatNumber}>{ownPosts.reduce((total, post) => total + post.likes + (likedIds.includes(post.id) ? 1 : 0), 0)}</Text><Text style={styles.profileStatLabel}>appreciations</Text></View>
          </View>
        </View>
        <View style={styles.feedHeading}>
          <Text style={styles.sectionTitle}>Your moments</Text>
          <Pressable onPress={() => showFeed('Saved')} accessibilityRole="button"><Text style={styles.textLink}>Saved posts →</Text></Pressable>
        </View>
        {renderPosts()}
      </>
    );
  }

  function renderNotifications() {
    return (
      <>
        <View style={styles.pageIntro}>
          <Text style={styles.eyebrow}>THE GOOD THINGS TRAVEL</Text>
          <Text style={styles.pageTitle}>Notifications.</Text>
          <Text style={styles.pageSubtitle}>A little love from your community.</Text>
        </View>
        <View style={styles.inboxCard}>
          {NOTIFICATIONS.map((item, index) => (
            <View key={item.id} style={[styles.notificationRow, index < NOTIFICATIONS.length - 1 && styles.conversationDivider]}>
              <View>
                <Avatar uri={item.avatar} size={48} />
                <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{item.icon}</Text></View>
              </View>
              <View style={styles.notificationCopy}>
                <Text style={styles.notificationText}><Text style={styles.authorName}>{item.name} </Text>{item.text}</Text>
                <Text style={styles.authorMeta}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </>
    );
  }

  function renderSidePanel() {
    if (!isWide || activeTab !== 'Home') return null;
    return (
      <View style={styles.sidePanel}>
        <View style={styles.sideCard}>
          <Text style={styles.sideCardTitle}>Your little corner</Text>
          <Text style={styles.sideCardCopy}>A space to show up as you are. No rush, no noise — just people who get it.</Text>
          <View style={styles.sideDivider} />
          <View style={styles.sideStatRow}><Text style={styles.sideStat}>✳</Text><Text style={styles.sideStatCopy}>Your circle has 3 new moments today</Text></View>
        </View>
        <View style={styles.sideCard}>
          <View style={styles.sideHeadingRow}><Text style={styles.sideCardTitle}>A few good topics</Text><Text style={styles.sideTiny}>See all</Text></View>
          {['Creative life', 'Everyday joy', 'Photography'].map((topic, index) => (
            <Pressable key={topic} onPress={() => { setSelectedCategory(topic); setActiveTab('Discover'); }} style={styles.topicRow}>
              <View style={[styles.topicDot, { backgroundColor: [COLORS.accent, '#6F8F78', '#9585B7'][index] }]} />
              <Text style={styles.topicText}>{topic}</Text><Text style={styles.topicArrow}>↗</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.footerNote}>Made for the moments in between. © 2026 Social Hub</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'Home', icon: '⌂', label: 'Home' },
    { id: 'Discover', icon: '⌕', label: 'Discover' },
    { id: 'Create', icon: '＋', label: 'Create' },
    { id: 'Inbox', icon: '▤', label: 'Inbox' },
    { id: 'Profile', icon: '◉', label: 'Profile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <Pressable onPress={() => showFeed('Home')} accessibilityRole="button" style={styles.brand}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>s</Text></View>
            <Text style={styles.brandName}>social<Text style={styles.brandNameHub}>hub</Text></Text>
          </Pressable>
          <View style={styles.topActions}>
            <IconButton label="Saved posts" onPress={() => showFeed('Saved')}>▢</IconButton>
            <IconButton label="Notifications" badge onPress={() => showFeed('Notifications')}>♧</IconButton>
            <Pressable onPress={() => showFeed('Profile')} accessibilityRole="button" accessibilityLabel="Your profile" style={styles.topAvatarButton}>
              <Avatar uri={profile.avatar} size={37} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.pageScroll} contentContainerStyle={styles.pageScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentLayout}>
            <View style={styles.mainColumn}>
              {activeTab === 'Home' ? renderHome() : null}
              {activeTab === 'Discover' ? renderDiscover() : null}
              {activeTab === 'Inbox' ? renderInbox() : null}
              {activeTab === 'Profile' ? renderProfile() : null}
              {activeTab === 'Saved' ? (
                <>
                  <View style={styles.pageIntro}><Text style={styles.eyebrow}>A LITTLE COLLECTION OF GOOD THINGS</Text><Text style={styles.pageTitle}>Saved for later.</Text><Text style={styles.pageSubtitle}>The posts you want to come back to.</Text></View>
                  {renderPosts()}
                </>
              ) : null}
              {activeTab === 'Notifications' ? renderNotifications() : null}
            </View>
            {renderSidePanel()}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => tab.id === 'Create' ? setComposerOpen(true) : showFeed(tab.id)}
              style={styles.tabButton}
            >
              <View style={[styles.tabIconWrap, activeTab === tab.id && styles.tabIconWrapActive, tab.id === 'Create' && styles.createTabIcon]}>
                <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabIconActive, tab.id === 'Create' && styles.createTabIconText]}>{tab.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Modal visible={composerOpen} transparent animationType="fade" onRequestClose={() => setComposerOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share a moment</Text>
              <Pressable onPress={() => setComposerOpen(false)} accessibilityRole="button" accessibilityLabel="Close composer" style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <View style={styles.composerUser}><Avatar uri={profile.avatar} size={42} /><View><Text style={styles.authorName}>{profile.name}</Text><Text style={styles.authorMeta}>Sharing with your circle</Text></View></View>
            <TextInput value={draft} onChangeText={setDraft} placeholder="What’s on your mind? Big things, little things — it all belongs here." placeholderTextColor={COLORS.muted} multiline maxLength={500} autoFocus style={styles.composerInput} accessibilityLabel="Write your post" />
            <View style={styles.composerFooter}><Text style={styles.characterCount}>{draft.length}/500</Text><AppButton label="Share with your circle" onPress={publishPost} style={!draft.trim() && styles.disabledButton} /></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={Boolean(commentPost)} transparent animationType="slide" onRequestClose={() => setCommentPost(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.commentModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>The conversation</Text>
              <Pressable onPress={() => setCommentPost(null)} accessibilityRole="button" accessibilityLabel="Close comments" style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.commentsList}>
              <Text style={styles.commentContext} numberOfLines={3}>{selectedPost?.text}</Text>
              {(comments[commentPost] || []).length === 0 ? <Text style={styles.noComments}>Be the first to leave a kind thought.</Text> : null}
              {(comments[commentPost] || []).map((comment) => (
                <View key={comment.id} style={styles.commentRow}><Avatar uri={comment.avatar} size={36} /><View style={styles.commentBubble}><Text style={styles.commentAuthor}>{comment.author}</Text><Text style={styles.commentText}>{comment.text}</Text></View></View>
              ))}
            </ScrollView>
            <View style={styles.commentComposer}>
              <TextInput value={commentDraft} onChangeText={setCommentDraft} placeholder="Add something kind..." placeholderTextColor={COLORS.muted} style={styles.commentInput} onSubmitEditing={addComment} returnKeyType="send" accessibilityLabel="Write a comment" />
              <Pressable onPress={addComment} accessibilityRole="button" accessibilityLabel="Post comment" style={styles.sendButton}><Text style={styles.sendButtonText}>↑</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={Boolean(activeStory)} transparent animationType="fade" onRequestClose={() => setActiveStory(null)}>
        <View style={styles.storyBackdrop}>
          {activeStory ? (
            <View style={[styles.storyScreen, { backgroundColor: activeStory.color }]}>
              <Image source={{ uri: activeStory.avatar }} style={styles.storyBackgroundImage} blurRadius={6} />
              <View style={styles.storyOverlay} />
              <View style={styles.storyProgress}><View style={styles.storyProgressFill} /></View>
              <View style={styles.storyTop}>
                <Avatar uri={activeStory.avatar} size={40} />
                <Text style={styles.storyScreenName}>{activeStory.name}</Text>
                <Pressable onPress={() => setActiveStory(null)} accessibilityRole="button" accessibilityLabel="Close story" style={styles.storyClose}><Text style={styles.storyCloseText}>×</Text></Pressable>
              </View>
              <View style={styles.storyMessage}><Text style={styles.storyCaption}>{activeStory.caption}</Text><Text style={styles.storyReply}>Say something kind…</Text></View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal visible={editingProfile} transparent animationType="fade" onRequestClose={() => setEditingProfile(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>A little about you</Text><Pressable onPress={() => setEditingProfile(false)} accessibilityRole="button" accessibilityLabel="Close edit profile" style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable></View>
            <Text style={styles.inputLabel}>YOUR NAME</Text>
            <TextInput value={nameDraft} onChangeText={setNameDraft} style={styles.editInput} accessibilityLabel="Your name" />
            <Text style={styles.inputLabel}>YOUR BIO</Text>
            <TextInput value={bioDraft} onChangeText={setBioDraft} multiline maxLength={180} style={[styles.editInput, styles.bioInput]} accessibilityLabel="Your bio" />
            <AppButton label="Save changes" onPress={() => {
              if (!nameDraft.trim()) return;
              const nextName = nameDraft.trim();
              if (nextName !== profile.name) {
                setPosts(posts.map((post) => post.author === profile.name ? { ...post, author: nextName } : post));
              }
              setProfile({ ...profile, name: nextName, bio: bioDraft.trim() });
              setEditingProfile(false);
            }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  appShell: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 68, paddingHorizontal: 24, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  brandMarkText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 25 },
  brandName: { color: COLORS.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.8 },
  brandNameHub: { color: COLORS.accent },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconButtonText: { color: COLORS.ink, fontSize: 23, lineHeight: 27 },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, borderWidth: 1, borderColor: COLORS.surface },
  topAvatarButton: { paddingLeft: 6 },
  avatar: { backgroundColor: '#E7E5DF' },
  pageScroll: { flex: 1 },
  pageScrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20 },
  contentLayout: { width: '100%', maxWidth: 1060, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 26 },
  mainColumn: { width: '100%', maxWidth: 650, flexShrink: 1 },
  greeting: { marginBottom: 25, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 },
  eyebrow: { color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  pageTitle: { color: COLORS.ink, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -1.1 },
  pageSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  writeButton: { backgroundColor: COLORS.accent, borderRadius: 12, minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  writeButtonPlus: { color: '#FFFFFF', fontSize: 20, lineHeight: 22, fontWeight: '500' },
  writeButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  storiesCard: { backgroundColor: COLORS.surface, borderRadius: 18, paddingTop: 17, paddingBottom: 13, marginBottom: 26, borderWidth: 1, borderColor: COLORS.line },
  storiesHeader: { paddingHorizontal: 18, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '750', letterSpacing: -0.25 },
  subtleText: { color: COLORS.muted, fontSize: 11 },
  storyList: { paddingHorizontal: 14, gap: 16 },
  storyItem: { width: 64, alignItems: 'center' },
  storyRing: { width: 64, height: 64, borderRadius: 23, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
  storyAvatar: { borderWidth: 2, borderColor: COLORS.surface },
  storyName: { marginTop: 8, maxWidth: 64, color: COLORS.ink, fontSize: 11, fontWeight: '600' },
  feedHeading: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  feedFilters: { flexDirection: 'row', backgroundColor: '#EDECE7', borderRadius: 9, padding: 3, gap: 2 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  filterChipActive: { backgroundColor: COLORS.surface, shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  filterChipText: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.ink },
  postCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 17, marginBottom: 16, borderWidth: 1, borderColor: COLORS.line },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  postAuthorText: { flex: 1 },
  authorName: { color: COLORS.ink, fontSize: 13, fontWeight: '700' },
  authorMeta: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  postCategory: { color: COLORS.green, fontSize: 10, fontWeight: '700', marginTop: 17, marginBottom: 7 },
  postCopy: { color: '#444641', fontSize: 13, lineHeight: 20 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginTop: 14, backgroundColor: '#ECECE7' },
  postStats: { paddingTop: 13, paddingBottom: 11, flexDirection: 'row', justifyContent: 'space-between' },
  postStatsText: { color: COLORS.muted, fontSize: 10 },
  postActions: { borderTopWidth: 1, borderTopColor: COLORS.line, paddingTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postAction: { minHeight: 33, flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { color: '#747771', fontSize: 18 },
  actionLabel: { color: '#686B66', fontSize: 10, fontWeight: '600' },
  likedIcon: { color: COLORS.accent },
  likedLabel: { color: COLORS.accent },
  saveAction: { width: 34, height: 33, alignItems: 'flex-end', justifyContent: 'center' },
  savedIcon: { color: COLORS.accent },
  moreMenu: { position: 'absolute', right: 0, top: 38, zIndex: 5, width: 165, paddingVertical: 4, borderRadius: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  moreMenuItem: { paddingHorizontal: 13, paddingVertical: 11 },
  moreMenuText: { color: COLORS.ink, fontSize: 12 },
  pressed: { opacity: 0.72 },
  pageIntro: { marginBottom: 22 },
  searchBox: { minHeight: 48, paddingHorizontal: 13, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  searchIcon: { color: COLORS.muted, fontSize: 25, lineHeight: 28 },
  searchInput: { flex: 1, color: COLORS.ink, fontSize: 12, paddingVertical: 10 },
  clearSearch: { color: COLORS.muted, fontSize: 21, paddingHorizontal: 5 },
  categoryList: { gap: 8, paddingBottom: 23 },
  categoryChip: { borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.surface, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  categoryChipActive: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  categoryChipText: { color: '#696B66', fontSize: 10, fontWeight: '600' },
  categoryChipTextActive: { color: '#FFFFFF' },
  peopleList: { gap: 10, paddingVertical: 13, paddingBottom: 22 },
  personCard: { width: 147, minHeight: 162, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 13, alignItems: 'flex-start' },
  personName: { color: COLORS.ink, fontSize: 11, fontWeight: '700', marginTop: 10 },
  personNote: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  appButton: { minHeight: 36, paddingHorizontal: 15, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  appButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  appButtonSecondary: { backgroundColor: COLORS.accentSoft },
  appButtonTextSecondary: { color: COLORS.accent },
  personFollowButton: { width: '100%', marginTop: 11, minHeight: 31 },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 18, paddingHorizontal: 24, paddingVertical: 34, marginBottom: 18, alignItems: 'center', borderWidth: 1, borderColor: COLORS.line },
  emptyIcon: { color: COLORS.accent, fontSize: 30, marginBottom: 8 },
  emptyTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '700' },
  emptyCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, marginBottom: 16, maxWidth: 280 },
  inboxCard: { paddingHorizontal: 17, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line },
  conversationRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12 },
  conversationDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  conversationText: { flex: 1, minWidth: 0 },
  conversationNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  conversationTime: { color: COLORS.muted, fontSize: 9 },
  conversationPreview: { color: COLORS.muted, fontSize: 11, marginTop: 6 },
  conversationUnread: { color: COLORS.ink, fontWeight: '600' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  inboxFootnote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 20 },
  thread: { minHeight: 530, maxHeight: 680, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, overflow: 'hidden' },
  threadHeader: { height: 68, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 28, height: 38, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: COLORS.ink, fontSize: 32, lineHeight: 35 },
  threadHeaderText: { flex: 1 },
  messageList: { flex: 1 },
  messageListContent: { padding: 16, gap: 10, justifyContent: 'flex-end', flexGrow: 1 },
  conversationNote: { color: COLORS.muted, textAlign: 'center', fontSize: 10, marginBottom: 12 },
  messageBubble: { maxWidth: '82%', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 15 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.green },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#F2F1ED' },
  messageText: { color: COLORS.ink, fontSize: 12, lineHeight: 18 },
  myMessageText: { color: '#FFFFFF' },
  messageComposer: { minHeight: 58, paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: 'row', alignItems: 'center', gap: 9 },
  messageInput: { flex: 1, minHeight: 39, paddingHorizontal: 13, borderRadius: 20, backgroundColor: '#F5F4F0', color: COLORS.ink, fontSize: 12 },
  sendButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: COLORS.accent },
  sendButtonDisabled: { opacity: 0.65 },
  sendButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 23 },
  profileHero: { backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, marginBottom: 22, overflow: 'hidden', paddingBottom: 17 },
  profileCover: { height: 122, backgroundColor: '#E8EFE8', overflow: 'hidden' },
  coverDecorOne: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: '#D6E4D9', top: -110, right: 25 },
  coverDecorTwo: { position: 'absolute', width: 145, height: 145, borderRadius: 73, backgroundColor: '#F5D6C9', top: 44, right: -14 },
  profileIdentity: { marginTop: -42, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  profileAvatar: { borderWidth: 4, borderColor: COLORS.surface },
  profileName: { marginTop: 11, marginHorizontal: 18, color: COLORS.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.6 },
  profileHandle: { marginTop: 3, marginHorizontal: 18, color: COLORS.muted, fontSize: 11 },
  profileBio: { marginTop: 11, marginHorizontal: 18, maxWidth: 490, color: '#656861', fontSize: 12, lineHeight: 18 },
  profileStats: { marginTop: 17, paddingTop: 13, marginHorizontal: 18, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  profileStat: { alignItems: 'center' },
  profileStatNumber: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  profileStatLabel: { color: COLORS.muted, fontSize: 9, marginTop: 2 },
  profileStatDivider: { width: 1, height: 26, backgroundColor: COLORS.line },
  textLink: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  notificationRow: { minHeight: 77, flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationBadge: { position: 'absolute', bottom: -1, right: -3, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderWidth: 2, borderColor: COLORS.surface },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 10, lineHeight: 12, fontWeight: '700' },
  notificationCopy: { flex: 1 },
  notificationText: { color: '#62645F', fontSize: 11, lineHeight: 17 },
  sidePanel: { width: 275, paddingTop: 5 },
  sideCard: { padding: 17, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, marginBottom: 13 },
  sideCardTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '750' },
  sideCardCopy: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 8 },
  sideDivider: { height: 1, backgroundColor: COLORS.line, marginVertical: 13 },
  sideStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sideStat: { color: COLORS.accent, fontSize: 17 },
  sideStatCopy: { color: '#676A64', fontSize: 10, flex: 1 },
  sideHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sideTiny: { color: COLORS.accent, fontSize: 9, fontWeight: '700' },
  topicRow: { minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicDot: { width: 7, height: 7, borderRadius: 4 },
  topicText: { color: '#636660', fontSize: 11, flex: 1 },
  topicArrow: { color: COLORS.muted, fontSize: 12 },
  footerNote: { color: '#A0A19B', fontSize: 9, lineHeight: 15, paddingHorizontal: 5 },
  bottomBar: { height: 67, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.line },
  tabButton: { flex: 1, height: 59, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIconWrap: { minWidth: 39, height: 31, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: { backgroundColor: COLORS.accentSoft },
  tabIcon: { color: '#969892', fontSize: 21, lineHeight: 24 },
  tabIconActive: { color: COLORS.accent },
  createTabIcon: { backgroundColor: COLORS.accent, width: 38, minWidth: 38, height: 38, borderRadius: 14 },
  createTabIconText: { color: '#FFFFFF', fontSize: 26, lineHeight: 29 },
  tabLabel: { color: '#999B95', fontSize: 9, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  modalBackdrop: { flex: 1, padding: 18, backgroundColor: 'rgba(27, 29, 26, 0.38)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '100%', maxWidth: 510, maxHeight: '90%', backgroundColor: COLORS.surface, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F1F0EC' },
  closeButtonText: { color: COLORS.ink, fontSize: 22, lineHeight: 25 },
  composerUser: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  composerInput: { minHeight: 150, maxHeight: 250, color: COLORS.ink, fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  composerFooter: { paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  characterCount: { color: COLORS.muted, fontSize: 10 },
  disabledButton: { opacity: 0.5 },
  commentModal: { height: '76%' },
  commentsList: { flex: 1 },
  commentContext: { color: COLORS.muted, fontSize: 11, lineHeight: 17, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.line, marginBottom: 14 },
  noComments: { color: COLORS.muted, fontSize: 12, paddingVertical: 20, textAlign: 'center' },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 13 },
  commentBubble: { flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#F5F4F0' },
  commentAuthor: { color: COLORS.ink, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  commentText: { color: '#545751', fontSize: 11, lineHeight: 16 },
  commentComposer: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.line },
  commentInput: { flex: 1, minHeight: 40, paddingHorizontal: 13, borderRadius: 20, backgroundColor: '#F5F4F0', color: COLORS.ink, fontSize: 11 },
  storyBackdrop: { flex: 1, backgroundColor: 'rgba(20, 20, 20, 0.92)', alignItems: 'center', justifyContent: 'center', padding: 14 },
  storyScreen: { width: '100%', maxWidth: 420, height: '92%', maxHeight: 780, borderRadius: 20, overflow: 'hidden', justifyContent: 'space-between' },
  storyBackgroundImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, opacity: 0.23 },
  storyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24, 26, 23, 0.34)' },
  storyProgress: { zIndex: 1, height: 3, marginHorizontal: 14, marginTop: 13, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.42)' },
  storyProgressFill: { height: 3, width: '100%', borderRadius: 2, backgroundColor: '#FFFFFF' },
  storyTop: { zIndex: 1, position: 'absolute', top: 30, left: 16, right: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  storyScreenName: { flex: 1, color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  storyClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  storyCloseText: { color: '#FFFFFF', fontSize: 28 },
  storyMessage: { zIndex: 1, padding: 22, gap: 22 },
  storyCaption: { color: '#FFFFFF', fontSize: 24, lineHeight: 33, fontWeight: '700', textAlign: 'center' },
  storyReply: { color: '#FFFFFF', fontSize: 11, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 22 },
  inputLabel: { color: COLORS.green, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  editInput: { minHeight: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, color: COLORS.ink, fontSize: 12, marginBottom: 15 },
  bioInput: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
});

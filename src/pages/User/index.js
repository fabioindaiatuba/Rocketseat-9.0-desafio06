import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
    flatListReady: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred?page=1`);

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  scrolledLit = () => {
    this.setState({ flatListReady: true });
  };

  loadMore = async () => {
    const { navigation } = this.props;
    const { page, stars, flatListReady } = this.state;
    if (flatListReady) {
      const user = navigation.getParam('user');

      this.setState({ loading: true });

      const response = await api.get(
        `/users/${user.login}/starred?page=${page + 1}`
      );

      this.setState({
        stars: [...stars, ...response.data],
        loading: false,
        page: page + 1,
      });
    }
  };

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    this.setState({ refreshing: true });

    const response = await api.get(
      `/users/${user.login}/starred?page=1&per_page=10`
    );

    this.setState({
      stars: [...response.data],
      loading: false,
      page: 1,
      refreshing: false,
    });
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? <ActivityIndicator color="#999" /> : <></>}
        <Stars
          onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
          onEndReached={this.loadMore}
          onScroll={this.scrolledLit}
          onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
          refreshing={refreshing}
          data={stars}
          keyExtractor={star => {
            return String(star.id);
          }}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}

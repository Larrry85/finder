package generated

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.66

import (
	//"backend/graph/generated"
	"backend/graph/model"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// CreateTodo is the resolver for the createTodo field.
func (r *mutationResolver) CreateTodo(ctx context.Context, input model.NewTodo) (*model.Todo, error) {
	panic(fmt.Errorf("not implemented: CreateTodo - createTodo"))
}

// User is the resolver for the user field.
func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
	url := fmt.Sprintf("http://localhost:8080/api/users/%s", id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user model.User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// Bio is the resolver for the bio field.
func (r *queryResolver) Bio(ctx context.Context, id string) (*model.Bio, error) {
	panic(fmt.Errorf("not implemented: Bio - bio"))
}

// Profile is the resolver for the profile field.
func (r *queryResolver) Profile(ctx context.Context, id string) (*model.Profile, error) {
	panic(fmt.Errorf("not implemented: Profile - profile"))
}

// Me is the resolver for the me field.
func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	panic(fmt.Errorf("not implemented: Me - me"))
}

// MyBio is the resolver for the myBio field.
func (r *queryResolver) MyBio(ctx context.Context) (*model.Bio, error) {
	panic(fmt.Errorf("not implemented: MyBio - myBio"))
}

// MyProfile is the resolver for the myProfile field.
func (r *queryResolver) MyProfile(ctx context.Context) (*model.Profile, error) {
	panic(fmt.Errorf("not implemented: MyProfile - myProfile"))
}

// Recommendations is the resolver for the recommendations field.
func (r *queryResolver) Recommendations(ctx context.Context) ([]*model.User, error) {
	panic(fmt.Errorf("not implemented: Recommendations - recommendations"))
}

// Connections is the resolver for the connections field.
func (r *queryResolver) Connections(ctx context.Context) ([]*model.User, error) {
	panic(fmt.Errorf("not implemented: Connections - connections"))
}

// Todos is the resolver for the todos field.
func (r *queryResolver) Todos(ctx context.Context) ([]*model.Todo, error) {
	panic(fmt.Errorf("not implemented: Todos - todos"))
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
